<script setup lang="ts">
import "@/assets/base.css";
import { RouterView, RouterLink, useRouter } from 'vue-router';
const router = useRouter();
</script>

<template>
	<header class="header">
		<ul class="pageSelector">
			<li v-for="route in router.options.routes">
				<RouterLink class="pageLink" :to="{ name: route.name }">{{ route.name }}</RouterLink>
			</li>
		</ul>
	</header>
	<main class="pageContent">
		<RouterView />
	</main>
</template>

<style lang="scss">
.header {
	margin-top: 3em;
	margin-bottom: 2em;
}
.pageContent {
	display: flex;
	justify-content: center;
	font-size: 12px;
}
.pageSelector {
	margin-top: 2em;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 2rem;
}
.pageLink {
	text-decoration: none;
	font-size: 2em;
	padding: 0.45em 0.55em;
	border-radius: 0.4em;
	box-shadow: 1px 1px 5px 2px rgba(0, 0, 0, 0.2);
	color: white;
	background-color: rgb(140, 140, 140);
	transition: background-color 0.15s;
	&:hover {
		background-color: rgb(120, 120, 120);
	}
	&:active,
	&.router-link-active:active {
		background-color: rgb(70, 70, 70);
	}
	&.router-link-active {
		background-color: rgb(90, 90, 90);
	}
}
</style>
