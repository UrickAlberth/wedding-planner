# Ideias de Design — Planejador de Casamento

## Abordagem 1 — Elegância Clássica Atemporal
<response>
<text>
**Design Movement:** Art Nouveau encontra Minimalismo Contemporâneo

**Core Principles:**
- Paleta quente e terrosa com tons creme, marfim e dourado envelhecido
- Tipografia serifada elegante para títulos, sans-serif refinada para corpo
- Espaçamento generoso com hierarquia visual clara
- Cards com sombras suaves e bordas delicadas

**Color Philosophy:**
Inspirado em papelaria de casamento de luxo — tons de pergaminho (#F5EFE6), rosa antigo (#C9A89B), dourado (#B8935A), marrom quente (#5C3D2E). Transmite romantismo, sofisticação e atemporalidade.

**Layout Paradigm:**
Dashboard assimétrico com sidebar fixa à esquerda para navegação entre seções. Conteúdo principal ocupa 75% da tela com cards flutuantes e espaçamento generoso.

**Signature Elements:**
- Ornamentos florais sutis como separadores de seção
- Gradiente suave de fundo (creme → branco pérola)
- Badges e tags com bordas arredondadas e cores pastéis

**Interaction Philosophy:**
Transições suaves e elegantes. Hover states com elevação de card. Animações de entrada com fade + slide.

**Animation:**
- Cards entram com fade-in + translateY(20px) → 0
- Botões com scale(1.02) no hover
- Checkboxes com animação de check personalizada

**Typography System:**
- Títulos: Playfair Display (serifada, elegante)
- Corpo: Lato ou Source Sans Pro (legível, moderno)
- Destaques: Cormorant Garamond italic
</text>
<probability>0.08</probability>
</response>

## Abordagem 2 — Romance Botânico Moderno
<response>
<text>
**Design Movement:** Botanical Illustration meets Modern Editorial

**Core Principles:**
- Verde sálvia, terracota e branco off-white como base
- Elementos botânicos decorativos (folhas, flores) como motivos visuais
- Layout editorial com grid assimétrico
- Fotografia e ilustração integradas ao design

**Color Philosophy:**
Verde sálvia (#7D9B76), terracota (#C4714F), creme (#FAF7F2), cinza quente (#8B8178). Evoca natureza, frescor e celebração orgânica.

**Layout Paradigm:**
Layout em colunas com navegação por tabs horizontais no topo. Cada seção ocupa a tela completa com scroll suave entre elas.

**Signature Elements:**
- Bordas decorativas com motivos botânicos
- Contadores animados com números grandes e elegantes
- Progresso visual com barras orgânicas

**Interaction Philosophy:**
Scroll-based animations. Elementos aparecem conforme o usuário rola a página.

**Animation:**
- Scroll reveal com Intersection Observer
- Números da contagem regressiva com flip animation
- Transições de seção com crossfade

**Typography System:**
- Títulos: Libre Baskerville (serifada clássica)
- Corpo: Nunito (arredondada, amigável)
- Accent: Dancing Script (cursiva para detalhes românticos)
</text>
<probability>0.07</probability>
</response>

## Abordagem 3 — Luxo Contemporâneo Dark
<response>
<text>
**Design Movement:** Contemporary Luxury meets Dark Editorial

**Core Principles:**
- Fundo escuro com acentos dourados e rosé gold
- Tipografia bold e expressiva para criar impacto visual
- Cards com glassmorphism sutil
- Hierarquia visual através de contraste e tamanho

**Color Philosophy:**
Preto profundo (#0D0D0D), dourado (#D4AF37), rosé gold (#B76E79), branco pérola (#F8F4EF). Transmite exclusividade, luxo e modernidade.

**Layout Paradigm:**
Dashboard de coluna única com navegação lateral colapsável. Seções com divisores visuais dramáticos.

**Signature Elements:**
- Glassmorphism nos cards principais
- Gradientes dourados nos títulos
- Ícones personalizados com estilo de linha fina

**Interaction Philosophy:**
Micro-interações sofisticadas. Cada ação tem feedback visual imediato e elegante.

**Animation:**
- Entrada de elementos com spring physics
- Ripple effect nos botões
- Parallax sutil no header

**Typography System:**
- Títulos: Bodoni Moda (serifada dramática)
- Corpo: DM Sans (clean, moderno)
- Números: Oswald (condensada, impactante)
</text>
<probability>0.06</probability>
</response>

---

## Escolha Final: Abordagem 1 — Elegância Clássica Atemporal

Design escolhido por combinar perfeitamente com o contexto de casamento: paleta quente e romântica, tipografia elegante com Playfair Display, layout de dashboard funcional com sidebar, e animações suaves que não distraem da usabilidade.
