import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  autenticarUsuario,
  cadastrarUsuario,
  destinoSeguro,
  obterUsuarioAutenticado,
} from './features/autenticacao/session'
import { CircularTestimonials } from './features/home/components/CircularTestimonials'
import { TubelightNavbar } from './shared/components/TubelightNavbar'
import { siteNavigationItems } from './shared/navigation/siteNavigation'
import './App.css'

const features = [
  { number: '01', title: 'Agenda que se organiza sozinha', description: 'Horários, profissionais e serviços em uma visão simples para sua equipe.' },
  { number: '02', title: 'Mais clientes recorrentes', description: 'Lembretes automáticos e uma experiência de reserva que dá vontade de voltar.' },
  { number: '03', title: 'Gestão sem planilhas', description: 'Acompanhe faturamento, ocupação e desempenho para decidir com segurança.' },
]

const plans = [
  { label: 'Essencial', value: 'Para começar', detail: 'Agenda online, cadastro de clientes e lembretes.' },
  { label: 'Profissional', value: 'Para crescer', detail: 'Tudo do Essencial + gestão da equipe e indicadores.' },
  { label: 'Rede', value: 'Para escalar', detail: 'Operação centralizada para várias unidades.' },
]

const testimonials = [
  { name: 'Ana Martins', designation: 'Sócia da Estúdio 45', quote: 'Em uma semana, a equipe já tinha parado de depender do caderno. Hoje a agenda trabalha pela gente.', src: 'https://cdn.21st.dev/assets/mirror/02/0204be31ac91de05dc9a78ea3438dda481ff3deaaffa40cb28e3bc1822ba3650.jpg' },
  { name: 'Rafael Costa', designation: 'Gestor da Barba & Cia', quote: 'O cliente agenda em poucos cliques e nós enxergamos o negócio inteiro em uma única tela.', src: 'https://cdn.21st.dev/assets/mirror/bb/bb5e69602eca31b29b15db66d5f95f5d6e1534037d1cc2c06e8cbb22cafb3a8f.jpg' },
  { name: 'Julia Lima', designation: 'Fundadora da Navalha Club', quote: 'A Nexo nos ajudou a abrir uma segunda unidade sem multiplicar a complexidade da operação.', src: 'https://cdn.21st.dev/assets/mirror/b1/b1e3120d49307c1e99ec979e6d05e79f67d7ecea727b27eb716a2b7bff5fe0bb.jpg' },
]

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [erro, setErro] = useState('')
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const retorno = destinoSeguro(searchParams.get('retorno'))

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const dados = new FormData(event.currentTarget)
    const usuario = autenticarUsuario(String(dados.get('email') ?? ''))
    if (!usuario) {
      setErro('Conta não encontrada. Crie seu cadastro para continuar.')
      return
    }
    navigate(retorno, { replace: true })
  }

  return (
    <div className="login-shell">
      <header className="login-header"><a className="brand" href="/" aria-label="Nexo Agenda, início"><span className="brand-mark">N</span><span>NEXO <small>AGENDA PARA BARBEARIAS</small></span></a><TubelightNavbar items={siteNavigationItems} /><Button asChild variant="unstyled"><a className="login-back-link" href="/">Voltar para o início <span>↗</span></a></Button></header>
      <main className="login-main"><section className="login-intro"><p className="eyebrow"><span /> Área do cliente</p><h1>Bom ter você<br /><em>por aqui.</em></h1><p>Entre para consultar seus horários, acompanhar seus agendamentos e manter sua operação em dia.</p></section><section className="login-panel" aria-labelledby="login-title"><div className="login-panel-heading"><p className="eyebrow"><span /> Acesso seguro</p><h2 id="login-title">Entrar na<br /><em>sua conta.</em></h2></div><form className="login-form" onSubmit={handleSubmit}><label htmlFor="email">E-mail<input id="email" name="email" type="email" placeholder="voce@email.com" autoComplete="email" required /></label><label htmlFor="password">Senha<div className="password-field"><input id="password" name="password" type={showPassword ? 'text' : 'password'} placeholder="Digite sua senha" autoComplete="current-password" required /><Button variant="unstyled" type="button" onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? 'Ocultar' : 'Mostrar'}</Button></div></label><Button variant="unstyled" className="button button-copper login-submit" type="submit">Entrar na minha conta <span>↗</span></Button>{erro && <p className="login-feedback login-error" role="alert">{erro}</p>}</form><p className="login-signup">Ainda não tem uma conta?</p><Button asChild variant="unstyled"><a className="button button-outline login-create-account" href={`/cadastro?retorno=${encodeURIComponent(retorno)}`}>Criar minha conta <span>↗</span></a></Button></section></main>
      <footer className="login-footer"><span>© 2026 Nexo Agenda</span><span>Privacidade · Termos de uso</span></footer>
    </div>
  )
}

export function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const retorno = destinoSeguro(searchParams.get('retorno'))

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const dados = new FormData(event.currentTarget)
    cadastrarUsuario({
      nome: String(dados.get('name') ?? ''),
      telefone: String(dados.get('phone') ?? ''),
      email: String(dados.get('email') ?? ''),
    })
    navigate(retorno, { replace: true })
  }

  return (
    <div className="login-shell">
      <header className="login-header">
        <a className="brand" href="/" aria-label="Nexo Agenda, início"><span className="brand-mark">N</span><span>NEXO <small>AGENDA PARA BARBEARIAS</small></span></a>
        <TubelightNavbar items={siteNavigationItems} />
        <Button asChild variant="unstyled"><a className="login-back-link" href={`/login?retorno=${encodeURIComponent(retorno)}`}>Já tenho uma conta <span>↗</span></a></Button>
      </header>
      <main className="login-main">
        <section className="login-intro"><p className="eyebrow"><span /> Novo cliente</p><h1>Seu negócio<br /><em>cresce aqui.</em></h1><p>Crie sua conta para organizar sua agenda e cuidar melhor da sua operação.</p></section>
        <section className="login-panel" aria-labelledby="register-title">
          <div className="login-panel-heading"><p className="eyebrow"><span /> Cadastro rápido</p><h2 id="register-title">Criar sua<br /><em>conta.</em></h2></div>
          <form className="login-form" onSubmit={handleSubmit}>
            <label htmlFor="register-name">Nome completo<input id="register-name" name="name" type="text" autoComplete="name" required /></label>
            <label htmlFor="register-phone">Telefone<input id="register-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" required /></label>
            <label htmlFor="register-email">E-mail<input id="register-email" name="email" type="email" autoComplete="email" required /></label>
            <label htmlFor="register-password">Crie uma senha<div className="password-field"><input id="register-password" name="password" type={showPassword ? 'text' : 'password'} minLength={8} autoComplete="new-password" required /><Button variant="unstyled" type="button" onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? 'Ocultar' : 'Mostrar'}</Button></div></label>
            <Button variant="unstyled" className="button button-copper login-submit" type="submit">Criar minha conta <span>↗</span></Button>
          </form>
          <p className="login-signup">Já possui uma conta? <a href={`/login?retorno=${encodeURIComponent(retorno)}`}>Entrar agora</a></p>
        </section>
      </main>
      <footer className="login-footer"><span>© 2026 Nexo Agenda</span><span>Privacidade · Termos de uso</span></footer>
    </div>
  )
}

function App() {
  const usuario = obterUsuarioAutenticado()
  const primeiroNome = usuario?.nome.trim().split(/\s+/)[0]

  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="brand" href="#inicio" aria-label="Nexo Agenda, início"><span className="brand-mark">N</span><span>NEXO <small>AGENDA PARA BARBEARIAS</small></span></a>
        <TubelightNavbar items={siteNavigationItems} />
        <Button asChild variant="unstyled"><a className="button button-dark header-button" href="/login">{primeiroNome ? `Olá, ${primeiroNome}` : 'Login'} <span>↗</span></a></Button>
      </header>

      <main>
        <section className="hero" id="inicio">
          <div className="hero-copy"><p className="eyebrow"><span /> Sistema de gestão para barbearias</p><h1>Sua agenda.<br /><em>Seu próximo nível.</em></h1><p className="hero-description">A Nexo organiza a rotina da sua barbearia para você cuidar do que realmente importa: seus clientes, sua equipe e o crescimento do negócio.</p><div className="hero-actions"><Button asChild variant="unstyled"><a className="button button-copper" href="#contato">Quero conhecer a Nexo <span>↗</span></a></Button><a className="text-link" href="#como-funciona">Veja como funciona <span>↓</span></a></div><div className="hero-note"><strong>+2.400</strong><span>barbearias colocando o negócio em movimento</span></div></div>
          <div className="hero-visual" aria-label="Prévia do painel Nexo Agenda"><div className="dashboard-window"><div className="dashboard-top"><span className="dashboard-logo">nexo<span>.</span></span><span className="dashboard-date">terça, 16 de setembro</span><span className="avatar">MC</span></div><div className="dashboard-body"><div className="dashboard-greeting"><div><span>Bom dia, Marina</span><strong>Sua operação hoje</strong></div><span className="dashboard-status">● agenda saudável</span></div><div className="metric-row"><div><small>Agendamentos</small><strong>28</strong><span>↗ 12% esta semana</span></div><div><small>Faturamento</small><strong>R$ 2.840</strong><span>↗ 8% esta semana</span></div></div><div className="schedule-head"><strong>Agenda de hoje</strong><span>Ver todos ↗</span></div><div className="schedule-list"><div><b>09:00</b><span className="schedule-dot orange" /><p><strong>Marcos Oliveira</strong><small>Corte + barba · João</small></p><em>Confirmado</em></div><div><b>10:30</b><span className="schedule-dot green" /><p><strong>Paula Ribeiro</strong><small>Corte clássico · Carlos</small></p><em>Confirmado</em></div><div><b>11:30</b><span className="schedule-dot pale" /><p><strong>Horário disponível</strong><small>Abra sua agenda para receber mais</small></p><em className="available">Livre</em></div></div></div></div><div className="hero-caption"><span>01</span><span>Clareza para decidir melhor</span></div></div>
        </section>

        <section className="trust-bar"><p>Feito para quem transforma atendimento em negócio</p><div><span>ESTÚDIO 45</span><span>NAVALHA CLUB</span><span>BARBA & CIA</span><span>CASA DO CORTE</span></div></section>

        <section className="services section-wrap" id="recursos"><div className="section-heading"><div><p className="eyebrow"><span /> Tudo em um só lugar</p><h2>Menos operação,<br /><em>mais evolução.</em></h2></div><p className="section-intro">A Nexo conecta agenda, equipe e relacionamento em uma plataforma feita para a realidade das barbearias.</p></div><div className="service-grid">{features.map((feature) => <article className="service-card" key={feature.number}><span className="service-number">{feature.number}</span><div><h3>{feature.title}</h3><p>{feature.description}</p></div><span className="card-arrow">↗</span></article>)}</div></section>

        <section className="process-section" id="como-funciona"><div className="section-wrap process-content"><div><p className="eyebrow light"><span /> Comece em poucos passos</p><h2>Uma plataforma que<br /><em>acompanha seu ritmo.</em></h2><p className="process-intro">Você conhece sua operação. A Nexo dá a clareza e as ferramentas para fazer ela avançar.</p></div><div className="steps"><div className="step"><span>01</span><div><h3>Configure sua operação</h3><p>Cadastre serviços, profissionais e horários em minutos.</p></div></div><div className="step"><span>02</span><div><h3>Compartilhe seu link</h3><p>Seus clientes agendam de onde estiverem, a qualquer hora.</p></div></div><div className="step"><span>03</span><div><h3>Acompanhe e cresça</h3><p>Use os dados da agenda para tomar decisões melhores.</p></div></div></div></div></section>

        <section className="plans section-wrap" id="planos"><div className="section-heading"><div><p className="eyebrow"><span /> Feito para cada fase</p><h2>Um plano para<br /><em>o seu momento.</em></h2></div><p className="section-intro">Comece pequeno, evolua com liberdade e tenha as ferramentas certas quando sua operação crescer.</p></div><div className="plan-grid">{plans.map((plan, index) => <article className={`plan-card${index === 1 ? ' featured' : ''}`} key={plan.label}><span className="plan-number">0{index + 1}</span><h3>{plan.label}</h3><strong>{plan.value}</strong><p>{plan.detail}</p><Button asChild variant="unstyled"><a href="#contato">Conhecer plano <span>↗</span></a></Button></article>)}</div></section>

        <section className="testimonials section-wrap" id="clientes" aria-labelledby="testimonials-title"><div className="testimonial-heading"><p className="eyebrow"><span /> Quem cresce com a Nexo</p><h2 id="testimonials-title">Histórias que<br /><em>movem negócios.</em></h2></div><CircularTestimonials testimonials={testimonials} autoplay /></section>

        <section className="contact-section section-wrap" id="contato"><div className="contact-copy"><p className="eyebrow"><span /> Vamos conversar</p><h2>Seu negócio tem<br /><em>muito a conquistar.</em></h2><p>Conte um pouco sobre sua barbearia. Nosso time entende sua rotina e mostra como a Nexo pode ajudar.</p><Button asChild variant="unstyled"><a className="button button-copper" href="mailto:oi@nexoagenda.com">Falar com um especialista <span>↗</span></a></Button></div><div className="contact-panel"><span className="panel-kicker">NEXO AGENDA</span><strong>Uma agenda mais inteligente para uma barbearia mais forte.</strong><div><span>oi@nexoagenda.com</span><span>Atendimento de segunda a sexta</span></div></div></section>
        <section className="final-cta"><p className="eyebrow light"><span /> O próximo passo é seu</p><h2>Abra espaço para<br /><em>o que faz crescer.</em></h2><Button asChild variant="unstyled"><a className="button button-copper" href="#contato">Conhecer a Nexo <span>↗</span></a></Button></section>
      </main>

      <footer className="site-footer"><a className="brand" href="#inicio"><span className="brand-mark">N</span><span>NEXO <small>AGENDA PARA BARBEARIAS</small></span></a><p>© 2026 Nexo Agenda. Tecnologia para o seu negócio.</p><div><a href="#recursos">Recursos</a><a href="mailto:oi@nexoagenda.com">Contato</a></div></footer>
    </div>
  )
}

export default App
