<script lang="ts">
</script>

<section class="hero animate-fade-in-up">
	<div class="hero-content">
		<h1 class="hero-title">
			<span class="title-line">Split expenses</span>
			<span class="title-accent">without the drama</span>
		</h1>
		<p class="hero-subtitle">
			Create a group, add your expenses, and let SplitUp figure out who owes whom. No math, no arguments.
		</p>
	</div>
	<div class="hero-visual">
		<div class="floating-card card-1">
			<div class="fc-avatar">A</div>
			<div class="fc-content">
				<span class="fc-name">Alice</span>
				<span class="fc-amount text-success">+$45.00</span>
			</div>
		</div>
		<div class="floating-card card-2">
			<div class="fc-avatar">B</div>
			<div class="fc-content">
				<span class="fc-name">Bob</span>
				<span class="fc-amount text-danger">-$32.50</span>
			</div>
		</div>
		<div class="floating-card card-3">
			<div class="fc-avatar">C</div>
			<div class="fc-content">
				<span class="fc-name">Carol</span>
				<span class="fc-amount text-success">+$12.00</span>
			</div>
		</div>
		<div class="connection-lines">
			<svg viewBox="0 0 200 120" fill="none">
				<path d="M30 90 Q 100 20, 170 90" stroke="var(--color-primary)" stroke-width="2" stroke-dasharray="4 4" opacity="0.3"/>
				<circle cx="30" cy="90" r="4" fill="var(--color-primary)" opacity="0.5"/>
				<circle cx="170" cy="90" r="4" fill="var(--color-primary)" opacity="0.5"/>
			</svg>
		</div>
	</div>
</section>

<style>
	.hero {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 48px;
		align-items: center;
		padding: 48px 0 64px;
	}

	.hero-title {
		font-family: var(--font-display);
		font-size: 48px;
		font-weight: 800;
		line-height: 1.1;
		letter-spacing: -0.03em;
		margin-bottom: 20px;
	}

	.title-line {
		display: block;
		color: var(--color-on-surface);
	}

	.title-accent {
		display: block;
		background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-tertiary) 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.hero-subtitle {
		font-size: 18px;
		color: var(--color-on-surface-variant);
		line-height: 1.6;
		max-width: 420px;
	}

	.hero-visual {
		position: relative;
		height: 200px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.floating-card {
		position: absolute;
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 16px 20px;
		background: var(--color-surface-bright);
		border-radius: var(--radius-lg);
		box-shadow: var(--elevation-3);
		border: 1px solid var(--color-outline-variant);
	}

	.card-1 {
		left: 10%;
		top: 20%;
		animation: float 4s ease-in-out infinite;
	}

	.card-2 {
		right: 10%;
		top: 30%;
		animation: float 4s ease-in-out infinite 0.5s;
	}

	.card-3 {
		left: 20%;
		bottom: 10%;
		animation: float 4s ease-in-out infinite 1s;
	}

	@keyframes float {
		0%, 100% { transform: translateY(0); }
		50% { transform: translateY(-10px); }
	}

	.fc-avatar {
		width: 44px;
		height: 44px;
		border-radius: var(--radius-full);
		background: var(--color-primary-container);
		color: var(--color-on-primary-container);
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 700;
		font-size: 16px;
	}

	.fc-content {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.fc-name {
		font-weight: 600;
		font-size: 15px;
	}

	.fc-amount {
		font-weight: 700;
		font-size: 14px;
	}

	.connection-lines {
		position: absolute;
		width: 100%;
		height: 100%;
		opacity: 0.6;
	}

	.connection-lines svg {
		width: 100%;
		height: 100%;
	}

	@media (max-width: 768px) {
		.hero {
			grid-template-columns: 1fr;
			text-align: center;
			padding: 32px 0 48px;
		}

		.hero-subtitle {
			max-width: none;
		}

		.hero-visual {
			display: none;
		}

		.hero-title {
			font-size: 36px;
		}
	}
</style>