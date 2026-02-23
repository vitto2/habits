# Versão Desktop - Guia de Responsividade

## Mudanças Realizadas

O projeto foi adaptado para funcionar em dispositivos desktop, tablet e mobile, mantendo todas as funcionalidades originais.

### 📱 Breakpoints de Responsividade

- **Mobile**: até 767px (layout original)
- **Tablet**: 768px - 1023px (layout otimizado)
- **Desktop**: 1024px+ (layout com sidebar)

### 🎨 Mudanças de Layout

#### **Mobile (< 1024px)**

- Header com título e indicadores em coluna
- Abas de navegação como botões horizontais no topo
- Conteúdo em coluna única
- Padding: 16px 20px

#### **Desktop (≥ 1024px)**

- **Sidebar fixa** (280px) à esquerda com navegação vertical
- **Conteúdo principal** ocupa o espaço restante
- **Grid responsivo** para hábitos (2-4 colunas dependendo do tamanho)
- **Gráficos lado a lado** (bar chart e heatmap)
- **Stat cards em 4 colunas**
- Padding maior: 24px 40px

### 📊 Componentes Adaptados

#### **Hábitos Ruins (Bad Habits)**

- Mobile: 1 coluna
- Desktop: até 4 colunas (grid automático)

#### **Hábitos Bons (Good Habits)**

- Mobile: 1 coluna
- Desktop: até 3 colunas (grid automático)

#### **Estatísticas**

- **Stat Cards**: 2 colunas (mobile) → 4 colunas (desktop)
- **Gráficos**: Vertical (mobile) → Horizontal lado a lado (desktop)
  - Bar Chart (últimos 7 dias)
  - Heatmap (12 semanas)
- **Radar Chart**: Full-width
- **Ranking de Consistência**: Full-width

#### **Abas/Navegação**

- Mobile: Abas horizontais no topo (Ruins | Bons | Stats)
- Desktop: Menu vertical na sidebar (com icons e descrição completa)

### 🛠️ Implementação Técnica

#### **Custom Hook: UseMediaQuery**

```jsx
function UseMediaQuery(query) {
	const [matches, setMatches] = useState(() => {
		if (typeof window === "undefined") return false;
		return window.matchMedia(query).matches;
	});

	useEffect(() => {
		const media = window.matchMedia(query);
		const listener = () => setMatches(media.matches);
		media.addEventListener("change", listener);
		return () => media.removeEventListener("change", listener);
	}, [query]);

	return matches;
}
```

#### **Uso de Breakpoints**

```jsx
const isDesktop = UseMediaQuery("(min-width: 1024px)");

// Layout adapta automaticamente
display: isDesktop ? "flex" : "block";
gridTemplateColumns: isDesktop ? "repeat(4, 1fr)" : "repeat(2, 1fr)";
```

### ✅ Todos os Recursos Funcionam em Todos os Tamanhos

- ✅ Rastreamento de hábitos ruins
- ✅ Rastreamento de hábitos bons
- ✅ Histórico de progresso
- ✅ Gráficos de desempenho
- ✅ Heatmap
- ✅ Estatísticas
- ✅ Marcos/Achievements
- ✅ Armazenamento local (localStorage)

### 📐 CSS Global

- `box-sizing: border-box` para melhor cálculo de dimensões
- Sem scroll horizontal em nenhum tamanho
- Suporte completo a `position: fixed` para sidebar desktop

### 🔄 Transição Suave

O layout se adapta automaticamente quando você redimensiona a janela (sem recarregar).

---

**Versão:** 1.0  
**Data:** 23 de fevereiro de 2026  
**Funcionalidade:** 100% mantida em todas as resoluções
