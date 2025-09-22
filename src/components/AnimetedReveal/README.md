# AnimatedReveal

Um componente reutilizável para revelar elementos com diferentes tipos de animação, utilizando **Material UI** e animações customizadas com **keyframes**.

## 📦 Instalação

```bash
npm install @mui/material @emotion/react @emotion/styled
Ou com yarn:

bash

yarn add @mui/material @emotion/react @emotion/styled
🔌 Importação
tsx

import { AnimatedReveal } from './AnimatedReveal'
⚙️ Props
Propriedade	Tipo	Padrão	Descrição
animation	AnimationType	slideInUp	Tipo de animação a ser usada (fade, slide, zoom, grow, collapse, etc).
duration	number	600	Duração da animação em ms.
delay	number	0	Delay inicial em ms antes da animação começar.
show	boolean	true	Controla se o elemento deve aparecer ou não.
direction	'up' | 'down' | 'left' | 'right'	up	Direção das animações do tipo slide.
stagger	number	0	Delay incremental aplicado a cada item (usado em listas).
index	number	0	Índice do item dentro de uma lista (usado com stagger).
className	string	undefined	Classe customizada.
sx	any	undefined	Estilos adicionais do MUI.

🎬 Exemplos de Uso
Fade
tsx

<AnimatedReveal animation="fade">
  <div>Fade In</div>
</AnimatedReveal>
Slide Up (default)
tsx

<AnimatedReveal animation="slideUp">
  <div>Slide para cima</div>
</AnimatedReveal>
Slide Down
tsx

<AnimatedReveal animation="slideDown">
  <div>Slide para baixo</div>
</AnimatedReveal>
Slide Left
tsx

<AnimatedReveal animation="slideLeft">
  <div>Slide para a esquerda</div>
</AnimatedReveal>
Slide Right
tsx

<AnimatedReveal animation="slideRight">
  <div>Slide para a direita</div>
</AnimatedReveal>
Zoom
tsx

<AnimatedReveal animation="zoom">
  <div>Zoom</div>
</AnimatedReveal>
Grow
tsx

<AnimatedReveal animation="grow">
  <div>Grow</div>
</AnimatedReveal>
Collapse
tsx

<AnimatedReveal animation="collapse">
  <div>Collapse</div>
</AnimatedReveal>
🎨 Animações customizadas (keyframes)
SlideInUp
tsx

<AnimatedReveal animation="slideInUp">
  <div>Slide In Up</div>
</AnimatedReveal>
SlideInDown
tsx

<AnimatedReveal animation="slideInDown">
  <div>Slide In Down</div>
</AnimatedReveal>
SlideInLeft
tsx

<AnimatedReveal animation="slideInLeft">
  <div>Slide In Left</div>
</AnimatedReveal>
SlideInRight
tsx

<AnimatedReveal animation="slideInRight">
  <div>Slide In Right</div>
</AnimatedReveal>
ScaleIn
tsx

<AnimatedReveal animation="scaleIn">
  <div>Scale In</div>
</AnimatedReveal>
BounceIn
tsx

<AnimatedReveal animation="bounceIn">
  <div>Bounce In</div>
</AnimatedReveal>
⏳ Exemplo com stagger (lista animada em sequência)
tsx

{['Item 1', 'Item 2', 'Item 3'].map((item, i) => (
  <AnimatedReveal
    key={i}
    animation="fade"
    duration={500}
    stagger={200}
    index={i}
  >
    <div>{item}</div>
  </AnimatedReveal>
))}
➡️ Cada item aparecerá com 200ms de atraso em relação ao anterior.

📝 Observações
Se quiser animar entradas sequenciais, use stagger junto com index.

O show={false} remove o elemento com a animação inversa (nos casos suportados pelo MUI).

Para animações customizadas (slideInUp, scaleIn, bounceIn), o show={false} apenas oculta instantaneamente, sem animação de saída.

yaml

```
