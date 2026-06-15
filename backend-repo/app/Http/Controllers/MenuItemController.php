<?php

namespace App\Http\Controllers;

use App\Models\MenuItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MenuItemController extends Controller
{
    // ─── Public ──────────────────────────────────────────────────────────────

    /**
     * Returns the full menu tree for the client-front.
     * Only is_enabled items are included; is_active reflects time restrictions.
     */
    public function index()
    {
        $all = MenuItem::where('is_enabled', true)
            ->orderBy('order')
            ->get();

        return response()->json($this->buildPublicTree($all));
    }

    private function buildPublicTree($items, $parentId = null): array
    {
        return $items
            ->filter(fn($i) => ($i->parent_id ?? null) === $parentId)
            ->values()
            ->map(fn($item) => [
                'id'            => $item->id,
                'label'         => $item->label,
                'is_active'     => $item->is_active,
                'resource_type' => $item->resource_type,
                'resource_url'  => $item->resource_url,
                'order'         => $item->order,
                'children'      => $this->buildPublicTree($items, $item->id),
            ])
            ->all();
    }

    // ─── Admin ────────────────────────────────────────────────────────────────

    /** Flat list of all items for the admin tree builder. */
    public function adminIndex()
    {
        $items = MenuItem::orderBy('parent_id')->orderBy('order')->get();
        return response()->json($items->map(fn($i) => $this->itemToArray($i)));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'parent_id'    => 'nullable|exists:menu_items,id',
            'label'        => 'required|string|max:255',
            'is_enabled'   => 'boolean',
            'active_from'  => 'nullable|date_format:H:i',
            'active_until' => 'nullable|date_format:H:i|required_with:active_from',
            'resource_type'=> 'nullable|in:pdf,image',
            'order'        => 'integer',
        ]);

        $item = MenuItem::create($data);
        return response()->json($this->itemToArray($item), 201);
    }

    public function show(MenuItem $menuItem)
    {
        return response()->json($this->itemToArray($menuItem));
    }

    public function update(Request $request, MenuItem $menuItem)
    {
        $data = $request->validate([
            'parent_id'    => 'nullable|exists:menu_items,id',
            'label'        => 'sometimes|required|string|max:255',
            'is_enabled'   => 'boolean',
            'active_from'  => 'nullable|date_format:H:i',
            'active_until' => 'nullable|date_format:H:i|required_with:active_from',
            'resource_type'=> 'nullable|in:pdf,image',
            'order'        => 'integer',
        ]);

        // Prevent attaching a resource to a parent that already has children
        if (array_key_exists('resource_type', $data) && $data['resource_type'] !== null) {
            if (MenuItem::where('parent_id', $menuItem->id)->exists()) {
                return response()->json([
                    'message' => 'No se puede asignar un recurso a un botón que tiene sub-botones.',
                ], 422);
            }
        }

        $menuItem->update($data);
        return response()->json($this->itemToArray($menuItem->fresh()));
    }

    public function destroy(MenuItem $menuItem)
    {
        $this->deleteResourceFiles($menuItem);
        $menuItem->delete(); // cascade removes children rows
        return response()->json(null, 204);
    }

    public function upload(Request $request, MenuItem $menuItem)
    {
        $request->validate([
            'file' => 'required|file|mimes:pdf,jpeg,jpg,png,gif,webp',
        ]);

        if (MenuItem::where('parent_id', $menuItem->id)->exists()) {
            return response()->json([
                'message' => 'No se puede asignar un recurso a un botón que tiene sub-botones.',
            ], 422);
        }

        if ($menuItem->resource_path) {
            Storage::disk('public')->delete($menuItem->resource_path);
        }

        $file = $request->file('file');
        $path = $file->store('menu-resources', 'public');

        $mime = $file->getMimeType();
        $resourceType = str_starts_with($mime, 'image/') ? 'image' : 'pdf';

        $menuItem->update([
            'resource_path' => $path,
            'resource_type' => $resourceType,
        ]);

        return response()->json($this->itemToArray($menuItem->fresh()));
    }

    public function reorder(Request $request)
    {
        $request->validate([
            'items'         => 'required|array',
            'items.*.id'    => 'required|exists:menu_items,id',
            'items.*.order' => 'required|integer',
        ]);

        foreach ($request->items as $entry) {
            MenuItem::where('id', $entry['id'])->update(['order' => $entry['order']]);
        }

        return response()->json(['ok' => true]);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private function itemToArray(MenuItem $item): array
    {
        return [
            'id'            => $item->id,
            'parent_id'     => $item->parent_id,
            'label'         => $item->label,
            'is_enabled'    => $item->is_enabled,
            'active_from'   => $item->active_from,
            'active_until'  => $item->active_until,
            'is_active'     => $item->is_active,
            'resource_type' => $item->resource_type,
            'resource_url'  => $item->resource_url,
            'order'         => $item->order,
        ];
    }

    private function deleteResourceFiles(MenuItem $item): void
    {
        if ($item->resource_path) {
            Storage::disk('public')->delete($item->resource_path);
        }
        foreach ($item->children as $child) {
            $this->deleteResourceFiles($child);
        }
    }
}
