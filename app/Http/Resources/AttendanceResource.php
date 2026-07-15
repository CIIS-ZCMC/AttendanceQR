<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AttendanceResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            "id" => $this->id,
            "title" => $this->title,
            "attendance_key" => $this->attendance_key,
            "is_active" => $this->is_active,
            "is_open" => $this->is_open,
            "no_location" => $this->no_location,
            "closed_at" => $this->closed_at ? date("h:ia | M j, Y", strtotime($this->closed_at)) : null,
            "closing_at" => $this->closed_at,
            "open_date" => $this->open_date,
            "closing_date" => $this->closing_date,
            "map_locations" => $this->whenLoaded('mapLocations', function () {
                return $this->mapLocations->map(function ($loc) {
                    return [
                        "id" => $loc->id,
                        "location" => $loc->location,
                        "description" => $loc->description,
                        "lat" => $loc->lat,
                        "lng" => $loc->lng,
                        "token" => $loc->token,
                        "open_time" => $loc->open_time,
                        "closing_time" => $loc->closing_time,
                    ];
                });
            }),
            "created_at" => date("F j, Y", strtotime($this->created_at)),
            "updated_at" => date("F j, Y", strtotime($this->updated_at)),
        ];
    }
}
