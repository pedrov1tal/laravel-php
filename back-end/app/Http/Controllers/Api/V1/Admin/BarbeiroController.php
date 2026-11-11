<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\StoreBarbeiroRequest;
use App\Http\Resources\Api\V1\BarbeiroResource;
use App\Models\Barbearia;
use Illuminate\Http\JsonResponse;

class BarbeiroController extends Controller
{
    public function store(StoreBarbeiroRequest $request, Barbearia $barbearia): JsonResponse
    {
        $barbeiro = $barbearia->barbeiros()->create($request->validated());

        return response()->json((new BarbeiroResource($barbeiro))->resolve($request), 201);
    }
}
