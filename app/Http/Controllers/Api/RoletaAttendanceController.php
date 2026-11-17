<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Attendance_Information;
use App\Models\EmployeeProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RoletaAttendanceController extends Controller
{
    public function resolveEmployees(Request $request): JsonResponse
    {
        if (! $this->isAuthorized($request)) {
            return response()->json(['message' => 'Unauthorized.'], 401);
        }

        $validated = $request->validate([
            'biometric_ids' => ['required', 'array', 'min:1', 'max:2000'],
            'biometric_ids.*' => ['required', 'string', 'max:64'],
        ]);

        $biometricIds = array_values(array_unique(array_map('trim', $validated['biometric_ids'])));
        $employees = $this->loadEmployeesByBiometricIds($biometricIds);

        return response()->json([
            'employees' => $employees,
        ]);
    }

    public function syncAttendance(Request $request): JsonResponse
    {
        if (! $this->isAuthorized($request)) {
            return response()->json(['message' => 'Unauthorized.'], 401);
        }

        $validated = $request->validate([
            'attendance_id' => ['nullable', 'integer'],
            'title' => ['required', 'string', 'max:255'],
            'event_date' => ['nullable', 'date'],
            'is_active' => ['nullable', 'boolean'],
            'is_open' => ['nullable', 'boolean'],
            'participants' => ['required', 'array', 'min:1', 'max:5000'],
            'participants.*.biometric_id' => ['required', 'string', 'max:64'],
            'participants.*.name' => ['required', 'string', 'max:255'],
            'participants.*.department' => ['nullable', 'string', 'max:255'],
            'participants.*.email' => ['nullable', 'string', 'max:255'],
            'participants.*.first_entry' => ['required', 'date'],
        ]);

        $biometricIds = array_values(array_unique(array_map(
            fn (array $p): string => trim($p['biometric_id']),
            $validated['participants']
        )));
        $employeeMap = $this->loadEmployeesByBiometricIds($biometricIds);

        $eventDate = $validated['event_date'] ?? now()->toDateString();
        $isActive = (bool) ($validated['is_active'] ?? false);
        $isOpen = (bool) ($validated['is_open'] ?? false);

        $result = DB::transaction(function () use ($validated, $employeeMap, $eventDate, $isActive, $isOpen): array {
            $attendance = null;
            if (! empty($validated['attendance_id'])) {
                $attendance = Attendance::find($validated['attendance_id']);
            }

            if ($attendance === null) {
                $attendance = Attendance::create([
                    'title' => $validated['title'],
                    'attendance_key' => 1,
                    'is_active' => $isActive,
                    'is_open' => $isOpen,
                    'open_date' => $eventDate,
                    'closing_date' => $eventDate,
                    'closed_at' => $isOpen ? null : now()->toDateTimeString(),
                    'no_location' => true,
                ]);
            }

            $createdCount = 0;
            $skippedCount = 0;
            $resolvedDepartments = [];

            foreach ($validated['participants'] as $participant) {
                $bioId = trim($participant['biometric_id']);
                $emp = $employeeMap[$bioId] ?? null;

                $area = $emp['area'] ?? ($participant['department'] ?? null);
                $areacode = $emp['areacode'] ?? null;
                $sector = $emp['sector'] ?? null;
                $email = $emp['email'] ?? ($participant['email'] ?? null);
                $name = $emp['name'] ?? trim($participant['name']);

                if ($emp !== null) {
                    $resolvedDepartments[$bioId] = [
                        'department' => $emp['department'],
                        'area' => $emp['area'],
                        'areacode' => $emp['areacode'],
                        'sector' => $emp['sector'],
                        'email' => $emp['email'],
                    ];
                }

                $record = Attendance_Information::firstOrCreate(
                    [
                        'biometric_id' => $bioId,
                        'attendances_id' => $attendance->id,
                    ],
                    [
                        'name' => $name,
                        'area' => $area,
                        'areacode' => $areacode,
                        'sector' => $sector,
                        'first_entry' => date('Y-m-d H:i:s', strtotime($participant['first_entry'])),
                        'last_entry' => null,
                        'map_location' => null,
                        'userToken' => "roleta-{$bioId}-{$attendance->id}",
                        'email' => $email,
                    ]
                );

                if ($record->wasRecentlyCreated) {
                    $createdCount++;
                } else {
                    $skippedCount++;
                }
            }

            return [
                'attendance' => [
                    'id' => $attendance->id,
                    'title' => $attendance->title,
                ],
                'total_received' => count($validated['participants']),
                'created_count' => $createdCount,
                'skipped_count' => $skippedCount,
                'resolved_departments' => $resolvedDepartments,
            ];
        });

        return response()->json($result, 200);
    }

    /**
     * @param  array<int, string>  $biometricIds
     * @return array<string, array<string, mixed>>
     */
    private function loadEmployeesByBiometricIds(array $biometricIds): array
    {
        if (empty($biometricIds)) {
            return [];
        }

        $profiles = EmployeeProfile::query()
            ->with([
                'assignedArea.division',
                'assignedArea.department',
                'assignedArea.section.department',
                'assignedArea.unit.section.department',
                'personalInformation.contact',
            ])
            ->whereIn('biometric_id', $biometricIds)
            ->get();

        $result = [];

        foreach ($profiles as $employee) {
            $assignedArea = $employee->assignedArea;
            $hasArea = $assignedArea && (
                $assignedArea->division_id !== null
                || $assignedArea->department_id !== null
                || $assignedArea->section_id !== null
                || $assignedArea->unit_id !== null
            );
            $areaDetails = $hasArea ? $assignedArea->findDetails() : null;
            $details = $areaDetails['details'] ?? null;
            $sector = $areaDetails['sector'] ?? null;

            $areaName = $details?->name ?? null;
            $areaCode = $details?->code ?? null;

            $departmentName = $assignedArea?->department?->name
                ?? $assignedArea?->section?->department?->name
                ?? $assignedArea?->unit?->section?->department?->name
                ?? $areaName;

            $personalInfo = $employee->personalInformation;
            $fullName = $personalInfo
                ? trim(($personalInfo->first_name ?? '') . ' ' . ($personalInfo->last_name ?? ''))
                : null;

            $bioKey = (string) $employee->biometric_id;
            $result[$bioKey] = [
                'biometric_id' => $bioKey,
                'employee_id' => $employee->employee_id,
                'name' => $fullName ?: null,
                'department' => $departmentName,
                'area' => $areaName,
                'areacode' => $areaCode,
                'sector' => $sector,
                'email' => $personalInfo?->contact?->email_address,
            ];
        }

        return $result;
    }

    private function isAuthorized(Request $request): bool
    {
        $expectedToken = config('services.roleta.token');
        if (empty($expectedToken)) {
            return true;
        }

        $provided = $request->header('X-Api-Token') ?: $request->bearerToken();

        return is_string($provided) && hash_equals((string) $expectedToken, $provided);
    }
}
