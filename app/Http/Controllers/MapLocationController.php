<?php

namespace App\Http\Controllers;

use App\Models\MapLocation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MapLocationController extends Controller
{
    public function index()
    {
        $mapLocations = MapLocation::orderBy('created_at', 'desc')->get();
        return response()->json($mapLocations, 200);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'location' => 'required|string|max:255',
            'description' => 'nullable|string',
            'lat' => 'required|numeric',
            'lng' => 'required|numeric',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if ($request->is_active) {
            MapLocation::where('is_active', true)->update(['is_active' => false]);
        }

        $mapLocation = MapLocation::create([
            'location' => $request->location,
            'description' => $request->description,
            'lat' => $request->lat,
            'lng' => $request->lng,
            'is_active' => $request->is_active ?? false,
        ]);

        // Also save to JSON file for dual storage
        $this->saveToJsonFile($mapLocation);

        return response()->json($mapLocation, 201);
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'location' => 'required|string|max:255',
            'description' => 'nullable|string',
            'lat' => 'required|numeric',
            'lng' => 'required|numeric',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $mapLocation = MapLocation::find($id);

        if (!$mapLocation) {
            return response()->json(['message' => 'Map location not found'], 404);
        }

        if ($request->is_active) {
            MapLocation::where('is_active', true)->update(['is_active' => false]);
        }

        $mapLocation->update([
            'location' => $request->location,
            'description' => $request->description,
            'lat' => $request->lat,
            'lng' => $request->lng,
            'is_active' => $request->is_active ?? $mapLocation->is_active,
        ]);

        // Also save to JSON file for dual storage
        $this->saveToJsonFile($mapLocation);

        return response()->json($mapLocation, 200);
    }

    public function destroy($id)
    {
        $mapLocation = MapLocation::find($id);

        if (!$mapLocation) {
            return response()->json(['message' => 'Map location not found'], 404);
        }

        $mapLocation->delete();

        return response()->json(['message' => 'Map location deleted successfully'], 200);
    }

    public function setActive($id)
    {
        $mapLocation = MapLocation::find($id);

        if (!$mapLocation) {
            return response()->json(['message' => 'Map location not found'], 404);
        }

        // Deactivate all other locations
        MapLocation::where('is_active', true)->update(['is_active' => false]);

        // Activate the selected location
        $mapLocation->update(['is_active' => true]);

        // Also save to JSON file for dual storage
        $this->saveToJsonFile($mapLocation);

        return response()->json($mapLocation, 200);
    }

    private function saveToJsonFile($mapLocation)
    {
        $file = storage_path('app/map_coordinates.json');
        $data = [];

        if (file_exists($file)) {
            $data = json_decode(file_get_contents($file), true);
        }

        // Update or add the coordinates
        $coordinates = [
            'latitude' => $mapLocation->lat,
            'longitude' => $mapLocation->lng,
            'saved_at' => now()->toISOString()
        ];

        if (!empty($data)) {
            $data[0] = $coordinates;
        } else {
            $data[] = $coordinates;
        }

        file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT));
    }
}
