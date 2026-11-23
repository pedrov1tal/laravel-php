<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\BarbeariaResource;
use App\Models\Barbearia;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class BarbeariaController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $barbearias = Barbearia::query()
            ->ativas()
            ->orderBy('nome')
            ->get();

        return BarbeariaResource::collection($barbearias);
    }
}
