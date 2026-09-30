<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Auth\LoginRequest;
use App\Http\Requests\Api\V1\Auth\RegisterRequest;
use App\Http\Resources\Api\V1\UserResource;
use App\Models\User;
use App\Services\JwtService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function __construct(private readonly JwtService $jwt) {}

    public function registro(RegisterRequest $request): JsonResponse
    {
        $dados = $request->validated();
        $usuario = User::query()->create([
            'name' => $dados['nome'],
            'email' => strtolower($dados['email']),
            'password' => Hash::make($dados['senha']),
        ]);

        return response()->json([
            'usuario' => (new UserResource($usuario))->resolve($request),
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $dados = $request->validated();
        $usuario = User::query()
            ->where('email', strtolower($dados['email']))
            ->first();

        if (! $usuario || ! Hash::check($dados['senha'], $usuario->password)) {
            return response()->json([
                'message' => 'E-mail ou senha inválidos.',
            ], 401);
        }

        return response()->json([
            'token' => $this->jwt->criarPara($usuario),
            'usuario' => (new UserResource($usuario))->resolve($request),
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'usuario' => (new UserResource($request->user()))->resolve($request),
        ]);
    }
}
