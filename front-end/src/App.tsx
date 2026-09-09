import { useState } from 'react'
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

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeTestimonial, setActiveTestimonial] = useState(0)

  const testimonial = testimonials[activeTestimonial]

  return (
    <div className="site-shell">
      <header className="site-header"><a className="brand" href="#inicio" aria-label="Norte Barbearia, início"><span className="brand-mark">N</span><span>NORTE <small>BARBEARIA</small></span></a><button className="menu-toggle" type="button" aria-expanded={mobileMenuOpen} aria-controls="main-navigation" onClick={() => setMobileMenuOpen((open) => !open)}>{mobileMenuOpen ? 'Fechar' : 'Menu'}</button><nav className={`main-nav${mobileMenuOpen ? ' is-open' : ''}`} id="main-navigation" aria-label="Navegação principal"><a href="#inicio" onClick={() => setMobileMenuOpen(false)}>Início</a><a href="#servicos" onClick={() => setMobileMenuOpen(false)}>Serviços</a><a href="#sobre" onClick={() => setMobileMenuOpen(false)}>Sobre</a><a href="#contato" onClick={() => setMobileMenuOpen(false)}>Contato</a><a className="mobile-booking-link" href="/agendar">Agendar horário</a></nav><a className="button button-dark header-button" href="/agendar">Agendar horário <span>↗</span></a></header>
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
