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

function App() {
  return (
    <div className="site-shell">
      <header className="site-header"><a className="brand" href="#inicio" aria-label="Norte Barbearia, início"><span className="brand-mark">N</span><span>NORTE <small>BARBEARIA</small></span></a><nav className="main-nav" aria-label="Navegação principal"><a href="#inicio">Início</a><a href="#servicos">Serviços</a><a href="#sobre">Sobre</a><a href="#contato">Contato</a></nav><a className="button button-dark header-button" href="/agendar">Agendar horário <span>↗</span></a></header>
      <main>
        <section className="hero" id="inicio"><div className="hero-copy"><p className="eyebrow"><span /> Estilo feito sob medida</p><h1>Seu estilo.<br /><em>Nosso cuidado.</em></h1><p className="hero-description">Agende seu próximo horário de forma rápida e simples. Um momento seu, cuidado em cada detalhe.</p><div className="hero-actions"><a className="button button-copper" href="/agendar">Agendar horário <span>↗</span></a><a className="text-link" href="#servicos">Conheça nossos serviços <span>↓</span></a></div><div className="hero-note"><strong>★ 4.9</strong><span>mais de 800 clientes satisfeitos</span></div></div><div className="hero-visual"><img src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=90" alt="Barbeiro finalizando o corte de um cliente" /><div className="hero-stamp">DESDE<br /><strong>2018</strong></div><div className="hero-caption"><span>01</span><span>Precisão em cada corte</span></div></div></section>
        <section className="services section-wrap" id="servicos"><div className="section-heading"><div><p className="eyebrow"><span /> O que fazemos</p><h2>Serviços que<br /><em>combinam com você.</em></h2></div><p className="section-intro">Mais do que um corte, entregamos uma experiência pensada para você sair se sentindo ainda melhor.</p></div><div className="service-grid">{services.map((service) => <article className="service-card" key={service.number}><span className="service-number">{service.number}</span><div><h3>{service.name}</h3><p>{service.description}</p><strong>{service.price}</strong></div><span className="card-arrow">↗</span></article>)}</div></section>
        <section className="process-section" id="sobre"><div className="section-wrap process-content"><div><p className="eyebrow light"><span /> Simples assim</p><h2>Seu próximo visual<br /><em>em três passos.</em></h2><p className="process-intro">Do primeiro clique ao último detalhe, deixamos tudo fácil para você.</p></div><div className="steps"><div className="step"><span>01</span><div><h3>Escolha seu serviço</h3><p>Encontre o cuidado ideal para o seu momento.</p></div></div><div className="step"><span>02</span><div><h3>Escolha seu horário</h3><p>Veja a agenda e reserve quando for melhor.</p></div></div><div className="step"><span>03</span><div><h3>Viva a experiência</h3><p>Chegue, relaxe e deixe o resto com a gente.</p></div></div></div></div></section>
        <section className="barbers section-wrap"><div className="section-heading barbers-heading"><div><p className="eyebrow"><span /> Nosso time</p><h2>Mãos experientes,<br /><em>estilo autêntico.</em></h2></div><p className="section-intro">Profissionais que entendem que o detalhe faz toda a diferença.</p></div><div className="barber-grid">{barbers.map((barber, index) => <article className="barber-card" key={barber.name}><div className="barber-image"><img src={barber.image} alt={barber.name} /><span>0{index + 1}</span></div><h3>{barber.name}</h3><p>{barber.role}</p></article>)}</div></section>
        <section className="place-section section-wrap" id="contato"><div className="place-image"><img src="https://images.unsplash.com/photo-1622288432450-277d0fef5ed6?auto=format&fit=crop&w=1200&q=85" alt="Interior aconchegante da Norte Barbearia" /></div><div className="place-copy"><p className="eyebrow"><span /> Um lugar para você</p><h2>Seu tempo merece<br /><em>um bom corte.</em></h2><p>Um espaço pensado para desacelerar, conversar e cuidar de você. Música boa, café passado na hora e um time que gosta do que faz.</p><div className="contact-details"><div><span>ENDEREÇO</span><strong>Rua Harmonia, 248<br />Vila Madalena, São Paulo</strong></div><div><span>HORÁRIOS</span><strong>Ter a Sex · 09h às 20h<br />Sáb · 09h às 18h</strong></div></div><a className="text-link" href="mailto:oi@nortebarber.com">Fale com a gente <span>↗</span></a></div></section>
        <section className="final-cta"><p className="eyebrow light"><span /> A cadeira é sua</p><h2>Pronto para o<br /><em>próximo nível?</em></h2><a className="button button-copper" href="/agendar">Agendar horário <span>↗</span></a></section>
      </main>
      <footer className="site-footer"><a className="brand" href="#inicio"><span className="brand-mark">N</span><span>NORTE <small>BARBEARIA</small></span></a><p>© 2026 Norte Barbearia. Feito para o seu estilo.</p><div><a href="#inicio">Instagram</a><a href="mailto:oi@nortebarber.com">Contato</a></div></footer>
    </div>
  )
}

export default App
