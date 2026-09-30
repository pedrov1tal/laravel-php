<?php

namespace App\Services;

use App\Models\User;
use JsonException;
use RuntimeException;

class JwtService
{
    public function criarPara(User $usuario): string
    {
        $agora = now()->timestamp;
        $cabecalho = $this->codificarJson(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload = $this->codificarJson([
            'sub' => (string) $usuario->getKey(),
            'iat' => $agora,
            'exp' => $agora + (int) config('jwt.ttl', 3600),
        ]);
        $assinatura = $this->assinar("{$cabecalho}.{$payload}");

        return "{$cabecalho}.{$payload}.{$assinatura}";
    }

    public function obterUsuarioId(string $token): int
    {
        $partes = explode('.', $token);

        if (count($partes) !== 3) {
            throw new RuntimeException('Token inválido.');
        }

        [$cabecalho, $payload, $assinatura] = $partes;
        $assinaturaEsperada = $this->assinar("{$cabecalho}.{$payload}");

        if (! hash_equals($assinaturaEsperada, $assinatura)) {
            throw new RuntimeException('Token inválido.');
        }

        try {
            $dadosCabecalho = json_decode($this->decodificarBase64Url($cabecalho), true, flags: JSON_THROW_ON_ERROR);
            $dadosPayload = json_decode($this->decodificarBase64Url($payload), true, flags: JSON_THROW_ON_ERROR);
        } catch (JsonException) {
            throw new RuntimeException('Token inválido.');
        }

        if (($dadosCabecalho['alg'] ?? null) !== 'HS256') {
            throw new RuntimeException('Token inválido.');
        }

        $expiracao = $dadosPayload['exp'] ?? null;
        $usuarioId = $dadosPayload['sub'] ?? null;

        if (! is_int($expiracao) || $expiracao <= now()->timestamp) {
            throw new RuntimeException('Token expirado.');
        }

        if (! is_string($usuarioId) || ! ctype_digit($usuarioId)) {
            throw new RuntimeException('Token inválido.');
        }

        return (int) $usuarioId;
    }

    private function assinar(string $conteudo): string
    {
        $segredo = config('jwt.secret');

        if (! is_string($segredo) || trim($segredo) === '') {
            throw new RuntimeException('JWT_SECRET não configurado.');
        }

        return $this->codificarBase64Url(hash_hmac('sha256', $conteudo, $segredo, true));
    }

    /**
     * @param  array<string, mixed>  $dados
     */
    private function codificarJson(array $dados): string
    {
        try {
            return $this->codificarBase64Url(json_encode($dados, JSON_THROW_ON_ERROR));
        } catch (JsonException) {
            throw new RuntimeException('Não foi possível gerar o token.');
        }
    }

    private function codificarBase64Url(string $valor): string
    {
        return rtrim(strtr(base64_encode($valor), '+/', '-_'), '=');
    }

    private function decodificarBase64Url(string $valor): string
    {
        $padding = (4 - strlen($valor) % 4) % 4;
        $decodificado = base64_decode(
            strtr($valor.str_repeat('=', $padding), '-_', '+/'),
            true,
        );

        if ($decodificado === false) {
            throw new RuntimeException('Token inválido.');
        }

        return $decodificado;
    }
}
