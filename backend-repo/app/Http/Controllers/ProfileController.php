<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function show()
    {
        return response()->json(auth()->user());
    }

    public function update(Request $request)
    {
        $request->validate([
            'name'                  => 'required|string|max:255',
            'password'              => 'nullable|min:8|confirmed',
            'password_confirmation' => 'nullable',
        ]);

        $user = auth()->user();
        $user->name = $request->name;
        if ($request->filled('password')) {
            $user->password = bcrypt($request->password);
        }
        $user->save();
        
        return response()->json($user);
    }
}
