<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';

const { status, changeStatusUrl, statusOptions } = defineProps<{
	status: string;
	changeStatusUrl: string;
	statusOptions: statusOption[];
}>();

type statusOption = {
	statusName: string;
	color: string;
};

const statusSelectionOpen = ref(false);
const statusValue = ref(status);
const statusColor = ref('#808080');
const listElementRef = ref<HTMLElement | null>(null);
const listElementOffset = ref<{ x: number; y: number }>({ x: 0, y: 0 });

function toggleDropdown() {
	// status list toggle handler
	statusSelectionOpen.value = !statusSelectionOpen.value;
	if (statusSelectionOpen.value) {
		if ((window as any).closeLastOpened) {
			(window as any).closeLastOpened();
		}
		(window as any).closeLastOpened = function () {
			statusSelectionOpen.value = false;
			(window as any).closeLastOpened = undefined;
		};
		window.addEventListener(
			'click',
			() => {
				if ((window as any).closeLastOpened) {
					(window as any).closeLastOpened();
				}
			},
			{ once: true }
		);
	} else {
		(window as any).closeLastOpened = undefined;
	}
}

async function selectStatus(status: string, color: string) {
	// status change handler
	statusValue.value = status;
	statusSelectionOpen.value = false;
	statusColor.value = color;
	(window as any).closeLastOpened = undefined;
}
onMounted(() => {
	// find appropriate color for status
	statusColor.value = statusOptions.find((statusOption) => statusOption.statusName === status)?.color ?? statusColor.value;
	if (statusOptions.length === 0) {
		console.warn('No status options supplied to component');
	}
});
watch(listElementRef, (ref) => {
	// prevent status list from rendering outside viewport
	if (ref) {
		const pos = ref.getBoundingClientRect();
		const windowHeight = window.innerHeight || document.documentElement.clientHeight;
		const windowWidth = window.innerWidth || document.documentElement.clientWidth;
		listElementOffset.value = {
			x: Math.min(listElementOffset.value.x, windowWidth - pos.right),
			y: Math.min(listElementOffset.value.y, windowHeight - pos.bottom),
		};
	}
});
function offsetString() {
	return `${listElementOffset.value.x}px, ${listElementOffset.value.y}px`;
}
</script>

<template>
	<div :class="$style.statusComponent">
		<button
			:class="[$style.statusValue, statusSelectionOpen ? $style.active : '']"
			@click.stop="toggleDropdown"
		>{{ statusValue }}</button>
		<div :class="$style.statusListMount">
			<ul ref="listElementRef" :class="$style.statusList" v-if="statusSelectionOpen">
				<li
					@click.stop="selectStatus(statusOption.statusName, statusOption.color)"
					:class="[$style.status, statusOption.statusName === statusValue ? $style.active : '']"
					v-for="statusOption in statusOptions"
					:key="statusOption.statusName"
				>
					<div :class="$style.statusColor" :style="{ backgroundColor: statusOption.color }" />
					<span :class="$style.statusName">{{ statusOption.statusName }}</span>
				</li>
			</ul>
		</div>
	</div>
</template>

<style module lang="scss">
.statusComponent {
	font-size: 1rem;
}
.statusValue {
	box-sizing: border-box;
	padding: 0.15em 0.6em;
	border-radius: 0.4rem;
	white-space: nowrap;
	transition: 0.15s;
	border: 2px solid v-bind(statusColor);
	background-color: transparent;
	&.active {
		color: white;
		border: 2px solid transparent;
		background-color: v-bind(statusColor);
	}
	&:hover {
		cursor: pointer;
	}
}
.statusListMount {
	position: relative;
}
.statusList {
	font-size: 0.9em;
	margin-top: 3px;
	position: absolute;
	background-color: white;
	border-radius: 10px;
	padding: 0;
	box-shadow: 0 0 25px 2px rgb(199, 199, 199);
	transform: translate(v-bind(offsetString()));
}
.status {
	display: flex;
	align-items: center;
	max-width: 13em;
	width: 13em;
	padding: 0.7em 0 0.7em 1.5em;
	/* transition: 0.05s; */
	border-left: 2px solid white;
	&.active {
		background-color: #ebf5fa;
		border-left: 2px solid #0085e0;
		.statusName {
			font-weight: 600;
		}
	}
	&:hover {
		cursor: pointer;
		.statusColor {
			border: 2px solid #f7f9fd;
		}
	}
	&:hover:not(.active) {
		background-color: #f7f9fd;
		border-left: 2px solid #f7f9fd;
	}
	&:first-of-type {
		padding-top: 1.1rem;
		border-radius: 10px 10px 0 0;
	}
	&:last-of-type {
		padding-bottom: 1.1rem;
		border-radius: 0 0 10px 10px;
	}
	&:active {
		transition: 0.1s;
		filter: brightness(95%);
	}
}
.statusColor {
	position: absolute;
	height: 15px;
	width: 15px;
	border-radius: 50%;
	border: 2px solid white;
}
.statusName {
	margin-left: 1.8rem;
	white-space: nowrap;
}
</style>
