<script setup lang="ts">
import "@/assets/reset.css";
import "@/assets/base.css";
import { RouterView, RouterLink, useRouter } from 'vue-router';
const router = useRouter();
</script>

<template>
	<div class="pageWrapper">
		<div class="page">
			<header>
				<div class="pageSelector">
					<RouterLink
						:to="{ name: route.name }"
						v-for="route in router.options.routes"
						class="pageLink"
					>{{ route.name }}</RouterLink>
				</div>
				<ul class="coloredButtonContainer">
					<li class="coloredButton" />
					<li class="coloredButton" />
					<li class="coloredButton" />
				</ul>
			</header>

			<main class="pageContent">
				<RouterView />
			</main>
		</div>
	</div>
</template>

<style lang="scss">
#app {
	display: flex;
	justify-content: center;
	overflow-x: hidden;
	min-height: 100vh;
}
header {
	display: flex;
	border-bottom: 1px solid rgba(0, 0, 0, 0.1);
	width: 100%;
}
.pageWrapper {
	padding: 0 2rem;
	@media (max-width: 900px) {
		padding: 0;
		padding-bottom: 0.5rem;
	}
}
.page {
	min-width: 360px;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	margin-top: 2rem;
	border-radius: 1rem;
	box-shadow: 1px 1px 5px 2px rgba(0, 0, 0, 0.2);
}
.pageSelector {
	border-radius: 1rem 0 0 0;
	overflow: hidden;
	display: flex;
}
.pageLink {
	text-decoration: none;
	font-size: 1.3em;
	padding: 0.35em 0.45em;
	color: black;
	background-color: transparent;
	user-select: none;
	transition: background-color 0.15s;
	&:hover {
		background-color: rgba(0, 0, 0, 0.05);
		cursor: pointer;
	}
	&:active,
	&.router-link-active:active {
		background-color: rgba(0, 0, 0, 0.15);
	}
	&.router-link-active {
		color: white;
		background-color: rgba(0, 0, 0, 0.5);
	}
}
.coloredButtonContainer {
	display: flex;
	align-items: center;
	margin-left: auto;
	margin-right: 15px;
	gap: 10px;
}
.coloredButton {
	height: 15px;
	width: 15px;
	border-radius: 50%;
	box-shadow: 0 0 5px 1px rgba(163, 163, 163, 0.272);
	&:nth-child(1) {
		background-color: rgb(40, 205, 65);
	}
	&:nth-child(2) {
		background-color: rgb(255, 149, 0);
	}
	&:nth-child(3) {
		background-color: rgb(255, 59, 48);
	}
}
.pageContent {
	font-size: 12px;
	width: 100%;
}
</style>
