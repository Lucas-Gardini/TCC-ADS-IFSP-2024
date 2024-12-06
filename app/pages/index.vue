<template>
	<div class="flex flex-col gap-4 mb-10 bg-surface-0 dark:bg-surface-900">
		<div class="flex flex-col gap-4 lg:flex-row bg-surface-0 bg-white dark:bg-surface-900 h-[100vh]">
			<div class="flex items-center justify-center flex-1">
				<div class="p-6 pt-12 lg:p-12">
					<h1 class="mb-4 text-3xl font-bold text-center lg:text-5xl text-surface-900 dark:text-surface-0 lg:leading-normal lg:text-left">
						Simplifique o Recrutamento e <br /><span class="text-blue-500 dark:text-blue-400">Otimize o Processo de Seleção</span>
					</h1>
					<p class="mb-8 leading-normal text-center text-surface-700 dark:text-surface-200 lg:text-left">
						Uma plataforma intuitiva e responsiva que centraliza currículos, automatiza a triagem e facilita a busca por candidatos
						ideais. Reduza o tempo e o esforço na seleção de talentos.
					</p>
					<div class="flex items-center justify-center gap-6 lg:justify-start">
						<Button label="Saiba Mais" type="button" @click="redirectGitHub" />
						<Button label="Acessar Plataforma" type="button" outlined @click="() => $router.push('/acessar')" />
					</div>
				</div>
			</div>
			<div class="flex-1 overflow-hidden">
				<img
					src="https://fqjltiegiezfetthbags.supabase.co/storage/v1/render/image/public/block.images/blocks/hero/hero-1.png"
					alt="hero-1"
					class="h-full w-full object-cover lg:[clip-path:polygon(12%_0,100%_0%,100%_100%,0_100%)]"
				/>
			</div>
		</div>

		<div class="px-6 py-20 text-center bg-surface-0 dark:bg-surface-950 md:px-12 lg:px-20">
			<div class="mb-4 text-3xl font-bold">
				<span class="text-surface-900 dark:text-surface-0">Uma Plataforma, </span>
				<span class="text-primary-600 dark:text-primary-400">Diversas Soluções para Recrutamento</span>
			</div>
			<div class="text-surface-700 dark:text-surface-0/70 mb-[3rem]">
				Com funcionalidades avançadas e automação integrada, nossa plataforma de banco de currículos transforma a forma como você encontra e
				avalia talentos.
			</div>
			<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-3.5 gap-y-6">
				<div class="w-full p-4">
					<span
						class="bg-white w-16 h-16 mb-6 rounded-lg flex items-center justify-center mx-auto bg-surface-0 dark:bg-surface-800 shadow-[0px_2px_6px_0px_rgba(0,0,0,0.12),0px_0px_2px_0px_rgba(0,0,0,0.06),0px_4px_10px_0px_rgba(0,0,0,0.03)]"
					>
						<Icon name="mdi:abacus" size="24" />
					</span>
					<div class="mb-2 text-xl font-medium text-surface-900 dark:text-surface-0">Criada para Desenvolvedores</div>
					<p class="max-w-sm mx-auto leading-normal text-center text-surface-700 dark:text-surface-0/70">
						Estrutura modular e escalável, pronta para integração com APIs e personalizável para atender às necessidades específicas da
						sua empresa.
					</p>
				</div>
				<div class="w-full p-4">
					<span
						class="bg-white w-16 h-16 mb-6 rounded-lg flex items-center justify-center mx-auto bg-surface-0 dark:bg-surface-800 shadow-[0px_2px_6px_0px_rgba(0,0,0,0.12),0px_0px_2px_0px_rgba(0,0,0,0.06),0px_4px_10px_0px_rgba(0,0,0,0.03)]"
					>
						<Icon name="mdi:lock" size="24" />
					</span>
					<div class="mb-2 text-xl font-medium text-surface-900 dark:text-surface-0">Criptografia de Ponta a Ponta</div>
					<p class="max-w-sm mx-auto leading-normal text-center text-surface-700 dark:text-surface-0/70">
						Garantia de segurança no armazenamento e gerenciamento dos dados dos candidatos, com autenticação segura e criptografia
						avançada.
					</p>
				</div>
				<div class="w-full p-4">
					<span
						class="bg-white w-16 h-16 mb-6 rounded-lg flex items-center justify-center mx-auto bg-surface-0 dark:bg-surface-800 shadow-[0px_2px_6px_0px_rgba(0,0,0,0.12),0px_0px_2px_0px_rgba(0,0,0,0.06),0px_4px_10px_0px_rgba(0,0,0,0.03)]"
					>
						<Icon name="mdi:hand-okay" size="24" />
					</span>
					<div class="mb-2 text-xl font-medium text-surface-900 dark:text-surface-0">Fácil de Usar</div>
					<p class="max-w-sm mx-auto leading-normal text-center text-surface-700 dark:text-surface-0/70">
						Interface intuitiva e acessível, que facilita a navegação e a organização de currículos para um processo de recrutamento mais
						rápido e eficiente.
					</p>
				</div>
				<div class="w-full p-4">
					<span
						class="bg-white w-16 h-16 mb-6 rounded-lg flex items-center justify-center mx-auto bg-surface-0 dark:bg-surface-800 shadow-[0px_2px_6px_0px_rgba(0,0,0,0.12),0px_0px_2px_0px_rgba(0,0,0,0.06),0px_4px_10px_0px_rgba(0,0,0,0.03)]"
					>
						<Icon name="mdi:rocket" size="24" />
					</span>
					<div class="mb-2 text-xl font-medium text-surface-900 dark:text-surface-0">Suporte Rápido e Global</div>
					<p class="max-w-sm mx-auto leading-normal text-center text-surface-700 dark:text-surface-0/70">
						Apoio ao usuário e assistência com integração de chatbots que ajudam na utilização da plataforma, proporcionando uma
						experiência otimizada.
					</p>
				</div>
				<div class="w-full p-4">
					<span
						class="bg-white w-16 h-16 mb-6 rounded-lg flex items-center justify-center mx-auto bg-surface-0 dark:bg-surface-800 shadow-[0px_2px_6px_0px_rgba(0,0,0,0.12),0px_0px_2px_0px_rgba(0,0,0,0.06),0px_4px_10px_0px_rgba(0,0,0,0.03)]"
					>
						<Icon name="mdi:source-branch" size="24" />
					</span>
					<div class="mb-2 text-xl font-medium text-surface-900 dark:text-surface-0">Open Source</div>
					<p class="max-w-sm mx-auto leading-normal text-center text-surface-700 dark:text-surface-0/70">
						Flexível e acessível, permitindo que qualquer empresa implemente a plataforma sem custo de licenciamento, adaptando-a conforme
						necessário.
					</p>
				</div>
				<div class="w-full p-4">
					<span
						class="bg-white w-16 h-16 mb-6 rounded-lg flex items-center justify-center mx-auto bg-surface-0 dark:bg-surface-800 shadow-[0px_2px_6px_0px_rgba(0,0,0,0.12),0px_0px_2px_0px_rgba(0,0,0,0.06),0px_4px_10px_0px_rgba(0,0,0,0.03)]"
					>
						<Icon name="mdi:shield-check" size="24" />
					</span>
					<div class="mb-2 text-xl font-medium text-surface-900 dark:text-surface-0">Segurança Confiável</div>
					<p class="max-w-sm mx-auto leading-normal text-center text-surface-700 dark:text-surface-0/70">
						Proteção avançada de dados, com autenticação e monitoramento de acesso para garantir a segurança e a integridade das
						informações armazenadas.
					</p>
				</div>
			</div>
		</div>

		<Card class="container mx-auto">
			<template #content>
				<div class="px-6 py-20 bg-surface-0 dark:bg-surface-950 md:px-12 lg:px-20">
					<div class="text-center text-surface-700 dark:text-surface-100">
						<div class="flex flex-row items-center justify-center mb-4 font-bold text-center text-primary">
							<Icon name="mdi:account-group" size="24" />&nbsp;SUPORTE E COMUNIDADE
						</div>
						<div class="mb-4 text-5xl font-bold text-surface-900 dark:text-surface-0">
							Precisa de ajuda sobre a plataforma, ou quer compartilhar algo sobre?
						</div>
						<div class="mb-8 text-2xl text-surface-700 dark:text-surface-100">
							Participe da nossa comunidade no Discord e tenha acesso a suporte rápido e global, além de interagir com outros usuários e
							desenvolvedores.
						</div>
						<Button @click="redirectDiscord" label="Participe Agora" raised rounded class="px-8 py-4 font-bold whitespace-nowrap">
							<Icon name="mdi:discord" size="24" />

							<span class="ml-2">Discord</span>
						</Button>
					</div>
				</div>
			</template>
		</Card>
	</div>
</template>

<script setup>
definePageMeta({ layout: "empty" });

function redirectDiscord() {
	window.location.href = "https://discord.gg/rA78pFPavy";
}

function redirectGitHub() {
	window.location.href = "https://github.com/Lucas-Gardini/TCC-ADS-2024";
}
</script>
