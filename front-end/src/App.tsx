import { useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

const services = [
  { number: '01', name: 'Corte clássico', description: 'Precisão, acabamento e aquele caimento que não sai de moda.', price: 'R$ 65' },
  { number: '02', name: 'Barba & ritual', description: 'Toalha quente, hidratação e contorno feito à navalha.', price: 'R$ 50' },
  { number: '03', name: 'Corte + barba', description: 'A experiência completa para sair daqui renovado.', price: 'R$ 105' },
]

const barbers = [
  { name: 'Caio Martins', role: 'Especialista em cortes', image: 'https://images.unsplash.com/photo-1588731247530-4076fc99173e?auto=format&fit=crop&w=700&q=85' },
  { name: 'Rafael Souza', role: 'Barbeiro e visagista', image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=700&q=85' },
  { name: 'Luan Ferreira', role: 'Especialista em barba', image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=700&q=85' },
]

const testimonials = [
  {
    initials: 'RM',
    name: 'Rafael Mendes',
    detail: 'Cliente desde 2019',
    quote: 'O atendimento é sempre no horário e o cuidado com os detalhes faz toda a diferença. É o meu momento de desacelerar na semana.',
  },
  {
    initials: 'LC',
    name: 'Lucas Carvalho',
    detail: 'Cliente desde 2021',
    quote: 'Encontrei um corte que combina comigo e uma equipe que já sabe exatamente como eu gosto. A experiência é impecável do início ao fim.',
  },
  {
    initials: 'DA',
    name: 'Diego Almeida',
    detail: 'Cliente desde 2023',
    quote: 'Ambiente acolhedor, conversa boa e um resultado que mantém a qualidade em todas as visitas. Recomendo sem pensar duas vezes.',
  },
]

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="login-shell">
      <header className="login-header"><a className="brand" href="/" aria-label="Norte Barbearia, início"><span className="brand-mark">N</span><span>NORTE <small>BARBEARIA</small></span></a><a className="login-back-link" href="/">Voltar para o início <span>↗</span></a></header>
      <main className="login-main">
        <section className="login-intro"><p className="eyebrow"><span /> Área do cliente</p><h1>Bom ter você<br /><em>por aqui.</em></h1><p>Entre para consultar seus horários, acompanhar seus agendamentos e manter seu estilo em dia.</p><div className="login-note"><span>“</span><p>Seu próximo momento começa com um simples clique.</p></div></section>
        <section className="login-panel" aria-labelledby="login-title"><div className="login-panel-heading"><p className="eyebrow"><span /> Acesso seguro</p><h2 id="login-title">Entrar na<br /><em>sua conta.</em></h2></div><form className="login-form" onSubmit={handleSubmit}><label htmlFor="email">E-mail<input id="email" name="email" type="email" placeholder="voce@email.com" autoComplete="email" required /></label><label htmlFor="password">Senha<div className="password-field"><input id="password" name="password" type={showPassword ? 'text' : 'password'} placeholder="Digite sua senha" autoComplete="current-password" required /><button type="button" aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? 'Ocultar' : 'Mostrar'}</button></div></label><div className="login-options"><label className="remember-option"><input type="checkbox" name="remember" /> <span>Manter conectado</span></label><a href="mailto:oi@nortebarber.com?subject=Recuperar%20senha">Esqueci minha senha</a></div><button className="button button-copper login-submit" type="submit">Entrar na minha conta <span>↗</span></button>{submitted && <p className="login-feedback" role="status">Dados recebidos. A autenticação será conectada à API em seguida.</p>}</form><p className="login-signup">Ainda não tem uma conta?</p><a className="button button-outline login-create-account" href="/cadastro">Criar minha conta <span>↗</span></a></section>
      </main>
      <footer className="login-footer"><span>© 2026 Norte Barbearia</span><span>Privacidade · Termos de uso</span></footer>
    </div>
  )
}

function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="login-shell">
      <header className="login-header"><a className="brand" href="/" aria-label="Norte Barbearia, início"><span className="brand-mark">N</span><span>NORTE <small>BARBEARIA</small></span></a><a className="login-back-link" href="/login">Já tenho uma conta <span>↗</span></a></header>
      <main className="login-main register-main">
        <section className="login-intro"><p className="eyebrow"><span /> Novo cliente</p><h1>Seu próximo<br /><em>corte começa aqui.</em></h1><p>Crie sua conta para agendar com mais rapidez e ter seus horários sempre à mão.</p><div className="login-note"><span>+</span><p>Uma conta simples para uma experiência ainda melhor.</p></div></section>
        <section className="login-panel" aria-labelledby="register-title"><div className="login-panel-heading"><p className="eyebrow"><span /> Cadastro rápido</p><h2 id="register-title">Criar sua<br /><em>conta.</em></h2></div><form className="login-form" onSubmit={handleSubmit}><label htmlFor="register-name">Nome completo<input id="register-name" name="name" type="text" placeholder="Como podemos chamar você?" autoComplete="name" required /></label><label htmlFor="register-email">E-mail<input id="register-email" name="email" type="email" placeholder="voce@email.com" autoComplete="email" required /></label><label htmlFor="register-phone">Telefone<input id="register-phone" name="phone" type="tel" placeholder="(00) 00000-0000" autoComplete="tel" required /></label><label htmlFor="register-password">Crie uma senha<div className="password-field"><input id="register-password" name="password" type={showPassword ? 'text' : 'password'} placeholder="Mínimo de 8 caracteres" minLength={8} autoComplete="new-password" required /><button type="button" aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? 'Ocultar' : 'Mostrar'}</button></div></label><label className="terms-option"><input type="checkbox" required /> <span>Concordo com os <a href="#termos">termos de uso</a> e a política de privacidade.</span></label><button className="button button-copper login-submit" type="submit">Criar minha conta <span>↗</span></button>{submitted && <p className="login-feedback" role="status">Cadastro recebido. Em breve sua conta estará pronta para agendamentos.</p>}</form><p className="login-signup">Já possui uma conta? <a href="/login">Entrar agora</a></p></section>
      </main>
      <footer className="login-footer"><span>© 2026 Norte Barbearia</span><span>Privacidade · Termos de uso</span></footer>
    </div>
  )
}

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeTestimonial, setActiveTestimonial] = useState(0)

  if (window.location.pathname === '/login') {
    return <LoginPage />
  }

  if (window.location.pathname === '/cadastro') {
    return <RegisterPage />
  }

  const testimonial = testimonials[activeTestimonial]

  return (
    <div className="site-shell">
      <header className="site-header"><a className="brand" href="#inicio" aria-label="Norte Barbearia, início"><span className="brand-mark">N</span><span>NORTE <small>BARBEARIA</small></span></a><button className="menu-toggle" type="button" aria-expanded={mobileMenuOpen} aria-controls="main-navigation" onClick={() => setMobileMenuOpen((open) => !open)}>{mobileMenuOpen ? 'Fechar' : 'Menu'}</button><nav className={`main-nav${mobileMenuOpen ? ' is-open' : ''}`} id="main-navigation" aria-label="Navegação principal"><a href="#inicio" onClick={() => setMobileMenuOpen(false)}>Início</a><a href="#servicos" onClick={() => setMobileMenuOpen(false)}>Serviços</a><a href="#sobre" onClick={() => setMobileMenuOpen(false)}>Sobre</a><a href="#contato" onClick={() => setMobileMenuOpen(false)}>Contato</a><a href="/login" onClick={() => setMobileMenuOpen(false)}>Entrar</a><a className="mobile-booking-link" href="/agendar">Agendar horário</a></nav><div className="header-actions"><a className="header-login-link" href="/login">Entrar</a><a className="button button-dark header-button" href="/agendar">Agendar horário <span>↗</span></a></div></header>
      <main>
        <section className="hero" id="inicio"><div className="hero-copy"><p className="eyebrow"><span /> Estilo feito sob medida</p><h1>Seu estilo.<br /><em>Nosso cuidado.</em></h1><p className="hero-description">Agende seu próximo horário de forma rápida e simples. Um momento seu, cuidado em cada detalhe.</p><div className="hero-actions"><a className="button button-copper" href="/agendar">Agendar horário <span>↗</span></a><a className="text-link" href="#servicos">Conheça nossos serviços <span>↓</span></a></div><div className="hero-note"><strong>★ 4.9</strong><span>mais de 800 clientes satisfeitos</span></div></div><div className="hero-visual"><img src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=90" alt="Barbeiro finalizando o corte de um cliente" /><div className="hero-stamp">DESDE<br /><strong>2018</strong></div><div className="hero-caption"><span>01</span><span>Precisão em cada corte</span></div></div></section>
        <section className="services section-wrap" id="servicos"><div className="section-heading"><div><p className="eyebrow"><span /> O que fazemos</p><h2>Serviços que<br /><em>combinam com você.</em></h2></div><p className="section-intro">Mais do que um corte, entregamos uma experiência pensada para você sair se sentindo ainda melhor.</p></div><div className="service-grid">{services.map((service) => <article className="service-card" key={service.number}><span className="service-number">{service.number}</span><div><h3>{service.name}</h3><p>{service.description}</p><strong>{service.price}</strong></div><span className="card-arrow">↗</span></article>)}</div></section>
        <section className="process-section" id="sobre"><div className="section-wrap process-content"><div><p className="eyebrow light"><span /> Simples assim</p><h2>Seu próximo visual<br /><em>em três passos.</em></h2><p className="process-intro">Do primeiro clique ao último detalhe, deixamos tudo fácil para você.</p></div><div className="steps"><div className="step"><span>01</span><div><h3>Escolha seu serviço</h3><p>Encontre o cuidado ideal para o seu momento.</p></div></div><div className="step"><span>02</span><div><h3>Escolha seu horário</h3><p>Veja a agenda e reserve quando for melhor.</p></div></div><div className="step"><span>03</span><div><h3>Viva a experiência</h3><p>Chegue, relaxe e deixe o resto com a gente.</p></div></div></div></div></section>
        <section className="barbers section-wrap"><div className="section-heading barbers-heading"><div><p className="eyebrow"><span /> Nosso time</p><h2>Mãos experientes,<br /><em>estilo autêntico.</em></h2></div><p className="section-intro">Profissionais que entendem que o detalhe faz toda a diferença.</p></div><div className="barber-grid">{barbers.map((barber, index) => <article className="barber-card" key={barber.name}><div className="barber-image"><img src={barber.image} alt={barber.name} /><span>0{index + 1}</span></div><h3>{barber.name}</h3><p>{barber.role}</p></article>)}</div></section>
        <section className="testimonials section-wrap" aria-labelledby="testimonials-title"><div className="testimonial-heading"><p className="eyebrow"><span /> Quem conhece, recomenda</p><h2 id="testimonials-title">A experiência<br /><em>fica na memória.</em></h2></div><div className="testimonial-content"><blockquote key={testimonial.name} aria-live="polite"><p>“{testimonial.quote}”</p><footer><strong>{testimonial.name}</strong><span>{testimonial.detail}</span></footer></blockquote><div className="testimonial-selector" role="group" aria-label="Escolha um depoimento">{testimonials.map((item, index) => <button className={index === activeTestimonial ? 'is-active' : ''} type="button" key={item.name} aria-pressed={index === activeTestimonial} onClick={() => setActiveTestimonial(index)}><span className="testimonial-initials" aria-hidden="true">{item.initials}</span><span><strong>{item.name}</strong><small>{item.detail}</small></span></button>)}</div></div></section>
        <section className="place-section section-wrap" id="contato"><div className="place-image"><img src="https://images.unsplash.com/photo-1622288432450-277d0fef5ed6?auto=format&fit=crop&w=1200&q=85" alt="Interior aconchegante da Norte Barbearia" /></div><div className="place-copy"><p className="eyebrow"><span /> Um lugar para você</p><h2>Seu tempo merece<br /><em>um bom corte.</em></h2><p>Um espaço pensado para desacelerar, conversar e cuidar de você. Música boa, café passado na hora e um time que gosta do que faz.</p><div className="contact-details"><div><span>ENDEREÇO</span><strong>Rua Harmonia, 248<br />Vila Madalena, São Paulo</strong></div><div><span>HORÁRIOS</span><strong>Ter a Sex · 09h às 20h<br />Sáb · 09h às 18h</strong></div></div><a className="text-link" href="mailto:oi@nortebarber.com">Fale com a gente <span>↗</span></a></div></section>
        <section className="final-cta"><p className="eyebrow light"><span /> A cadeira é sua</p><h2>Pronto para o<br /><em>próximo nível?</em></h2><a className="button button-copper" href="/agendar">Agendar horário <span>↗</span></a></section>
      </main>
      <footer className="site-footer"><a className="brand" href="#inicio"><span className="brand-mark">N</span><span>NORTE <small>BARBEARIA</small></span></a><p>© 2026 Norte Barbearia. Feito para o seu estilo.</p><div><a href="#inicio">Instagram</a><a href="mailto:oi@nortebarber.com">Contato</a></div></footer>
    </div>
  )
}

export default App
