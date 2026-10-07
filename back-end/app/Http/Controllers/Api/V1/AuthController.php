<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Auth\AlterarSenhaRequest;
use App\Http\Requests\Api\V1\Auth\LoginRequest;
use App\Http\Requests\Api\V1\Auth\RegisterRequest;
use App\Http\Resources\Api\V1\ClienteResource;
use App\Http\Resources\Api\V1\SessaoResource;
use App\Http\Resources\Api\V1\UserResource;
use App\Models\Cliente;
use App\Models\User;
use App\Services\JwtService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function __construct(private readonly JwtService $jwt) {}

    public function registro(RegisterRequest $request): JsonResponse
    {
        $dados = $request->validated();
        [$usuario, $cliente] = DB::transaction(function () use ($dados): array {
            $usuario = User::query()->create([
                'name' => $dados['nome'],
                'email' => strtolower($dados['email']),
                'password' => Hash::make($dados['senha']),
            ]);

            $cliente = Cliente::query()->create([
                'user_id' => $usuario->getKey(),
                'nome' => $dados['nome'],
                'telefone' => $dados['telefone'],
                'email' => strtolower($dados['email']),
            ]);

            return [$usuario, $cliente];
        });

        return response()->json([
            'usuario' => (new UserResource($usuario))->resolve($request),
            'cliente' => (new ClienteResource($cliente))->resolve($request),
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
        $usuario = $request->user();
        $usuario->load([
            'cliente',
            'barbeariasAdministradas' => fn ($query) => $query->where('ativa', true),
            'perfisBarbeiro' => fn ($query) => $query
                ->where('ativo', true)
                ->with('barbearia'),
        ]);

        return response()->json(
            (new SessaoResource($usuario))->resolve($request),
        );
    }

    /**
     * @throws ValidationException
     */
    public function alterarSenha(AlterarSenhaRequest $request): JsonResponse
    {
        $dados = $request->validated();
        $usuario = $request->user();

        if (! Hash::check($dados['senha_atual'], $usuario->password)) {
            throw ValidationException::withMessages([
                'senha_atual' => ['A senha atual está incorreta.'],
            ]);
        }

        $usuario->forceFill([
            'password' => Hash::make($dados['nova_senha']),
            'deve_trocar_senha' => false,
        ])->save();

        return response()->json([
            'message' => 'Senha alterada com sucesso.',
            'usuario' => (new UserResource($usuario))->resolve($request),
        ]);
    }
}
