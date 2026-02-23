# 🎯 Habits Tracker - Versão Desktop & Responsive

Uma aplicação elegante e completa de rastreamento de hábitos que funciona perfeitamente em **mobile, tablet e desktop**.

## 🌟 Características Principais

### 📱 **Totalmente Responsivo**

- ✅ Mobile first design (< 1024px)
- ✅ Layout adaptativo com sidebar em desktop (≥ 1024px)
- ✅ Transições suaves ao redimensionar

### 📊 **Funcionalidades**

- 🚫 **Hábitos Ruins**: Rastreie dias sem recaída
- ✅ **Hábitos Bons**: Academia, Dieta, Água, Estudo, etc.
- 📈 **Estatísticas**: Gráficos, heatmap, rankings
- 🏆 **Marcos/Achievements**: Desbloqueia conquistas
- 💾 **Persistência**: Dados salvos localmente

### 🎨 **Design**

- Tema escuro elegante
- Interface minimalista
- Gráficos com Recharts
- Animações fluidas

---

## 🎮 Como Usar

### **Mobile (Padrão)**

Abra em qualquer smartphone ou em modo responsive do navegador.

```
Abas no topo: [🚫 Ruins] [✅ Bons] [📊 Stats]
Conteúdo em coluna única
```

### **Desktop (Novo)**

Abra em uma tela com largura ≥ 1024px.

```
Sidebar na esquerda com navegação vertical
Conteúdo em grid responsivo (2-4 colunas)
Gráficos lado a lado
```

---

## 🏗️ Estrutura de Breakpoints

| Dispositivo | Largura        | Layout                        |
| ----------- | -------------- | ----------------------------- |
| Mobile      | < 768px        | 1 coluna, abas no topo        |
| Tablet      | 768px - 1023px | 1-2 colunas, abas no topo     |
| Desktop     | ≥ 1024px       | Sidebar + grid, menu vertical |

---

## 💾 Armazenamento

Todos os dados são salvos no **localStorage**:

- `relapses`: Rastreamento de hábitos ruins
- `goodProgress`: Progresso diário de hábitos bons
- `history`: Histórico completo de desempenho

---

## 🔧 Stack Técnico

- **React 19**: Framework principal
- **Recharts**: Gráficos e visualizações
- **Vite**: Build tool rápido
- **Responsive Design**: Media queries customizadas
- **CSS-in-JS**: Styles inline para máxima flexibilidade

---

## 📐 Componentes Principais

### **UseMediaQuery Hook**

Detecta se é desktop ou mobile:

```jsx
const isDesktop = UseMediaQuery("(min-width: 1024px)");
```

### **Layouts Adaptativos**

```jsx
// Grid automático
gridTemplateColumns: isDesktop ? "repeat(4, 1fr)" : "repeat(2, 1fr)";

// Sidebar condicional
{
	isDesktop && <Sidebar />;
}
```

---

## 📊 Visualizações

### **Mobile**

```
┌─────────────────┐
│ MODO DISCIPLINA │
│  Tracker Pessoal│
│ 6/6 | 🔥23d    │
├─────────────────┤
│[🚫] [✅] [📊]  │ ← Abas
├─────────────────┤
│                 │
│  Conteúdo       │
│  1 coluna       │
│                 │
└─────────────────┘
```

### **Desktop**

```
┌─────┬──────────────────────────┐
│ S  │                          │
│ I  │  [Bar Chart] [Heatmap]   │
│ D  │                          │
│ E  │  ┌──┬──┬──┬──┐          │
│ B  │  │  │  │  │  │ Stats   │
│ A  │  └──┴──┴──┴──┘          │
│ R  │                          │
│    │  Grid 4 colunas          │
│ [🚫]│  • Hábitos Ruins        │
│ [✅]│  • Hábitos Bons         │
│ [📊]│                          │
└─────┴──────────────────────────┘
```

---

## 🚀 Como Rodar

```bash
# Instalação
npm install

# Desenvolvimento
npm run dev

# Build
npm run build

# Preview
npm run preview

# Linting
npm run lint
```

---

## 📝 Notas Importantes

- ⚠️ A sidebar em desktop é **fixed** (não scrolls)
- ⚠️ O conteúdo principal scrolls independentemente
- ⚠️ Sem scroll horizontal em nenhuma resolução
- ⚠️ Todas as funcionalidades funcionam em **todos** os tamanhos

---

## 🎯 Objetivos Atingidos

✅ Versão mobile original mantida (100% compatível)
✅ Versão desktop com sidebar (novo)
✅ Layout responsivo adaptativo
✅ Nenhuma funcionalidade perdida
✅ Interface elegante e profissional
✅ Sem erros de linting
✅ Performance otimizada

---

## 📌 Próximos Passos (Opcional)

- [ ] Sincronização com cloud
- [ ] Compartilhamento de metas
- [ ] Notificações/lembretes
- [ ] Temas customizáveis
- [ ] Exportação de dados

---

**Versão**: 2.0 (Desktop Ready)  
**Status**: ✅ **PRODUÇÃO**  
**Data**: 23 de fevereiro de 2026  
**Licença**: MIT
