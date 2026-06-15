<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MenuItem extends Model
{
    protected $fillable = [
        'parent_id', 'label', 'is_enabled', 'active_from', 'active_until',
        'resource_type', 'resource_path', 'order',
    ];

    protected $casts = [
        'is_enabled' => 'boolean',
        'order'      => 'integer',
        'parent_id'  => 'integer',
    ];

    public function children(): HasMany
    {
        return $this->hasMany(MenuItem::class, 'parent_id')->orderBy('order');
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(MenuItem::class, 'parent_id');
    }

    public function getIsActiveAttribute(): bool
    {
        if (!$this->is_enabled) return false;
        if (!$this->active_from || !$this->active_until) return true;

        $now   = now()->format('H:i:s');
        $from  = $this->active_from;
        $until = $this->active_until;

        // Support ranges that cross midnight (e.g. 22:00–02:00)
        if ($from > $until) {
            return $now >= $from || $now <= $until;
        }

        return $now >= $from && $now <= $until;
    }

    public function getResourceUrlAttribute(): ?string
    {
        if (!$this->resource_path) return null;
        return url('api/media/' . $this->resource_path);
    }
}
