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
            'open_time' => 'required|date_format:H:i',
            'closing_time' => 'required|date_format:H:i|after:open_time',
            'is_default' => 'nullable|boolean',
            'w_map' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if ($request->boolean('is_default')) {
            MapLocation::where('is_default', true)->update(['is_default' => false]);
        }

        $mapLocation = MapLocation::create([
            'location' => $request->location,
            'description' => $request->description,
            'lat' => $request->lat,
            'lng' => $request->lng,
            'open_time' => $request->open_time,
            'closing_time' => $request->closing_time,
            'is_default' => $request->boolean('is_default'),
            'w_map' => $request->boolean('w_map'),
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
            'open_time' => 'required|date_format:H:i',
            'closing_time' => 'required|date_format:H:i|after:open_time',
            'is_default' => 'nullable|boolean',
            'w_map' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $mapLocation = MapLocation::find($id);

        if (!$mapLocation) {
            return response()->json(['message' => 'Map location not found'], 404);
        }

        if ($request->boolean('is_default')) {
            MapLocation::where('is_default', true)->where('id', '!=', $id)->update(['is_default' => false]);
        }

        $mapLocation->update([
            'location' => $request->location,
            'description' => $request->description,
            'lat' => $request->lat,
            'lng' => $request->lng,
            'open_time' => $request->open_time,
            'closing_time' => $request->closing_time,
            'is_default' => $request->boolean('is_default'),
            'w_map' => $request->boolean('w_map'),
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
