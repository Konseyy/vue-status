<script setup lang="ts">
import type { status } from '@/library/types';
import { onMounted, ref, watch } from 'vue';

const props = defineProps<{
	title: string;
	titleRatio?: number;
	startingStatus: status;
	statusOptions: status[];
	modifyStatus: (newStatus: string) => void;
	reorderStatusOptions: (newOptions: status[]) => void;
}>();
const statusSelectionOpen = ref(false);
const statusValue = ref<status>(props.startingStatus);
const labelIsHovered = ref(false);
const listElementRef = ref<HTMLElement | null>(null);
const listElementOffset = ref<{ x: number; y: number }>({ x: 0, y: 0 });
const titleRatio = `${props.titleRatio ?? 1}em`;

function debounce(func: Function, timeout: number,) {
	let timer: number
	return (...args: any[]) => {
		clearTimeout(timer)
		timer = setTimeout(() => {
			func(...args)
		}, timeout)
	}
}
function isStatusActive(status: status) {
	return status.status_id === statusValue.value.status_id
}
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

async function selectStatus(status: status) {
	// status change handler
	statusValue.value = status;
	statusSelectionOpen.value = false;
	(window as any).closeLastOpened = undefined;
	props.modifyStatus(status.status_id);
}
function calculateOffset() {
	if (!listElementRef.value) return { x: 0, y: 0 };
	// prevent status list from rendering outside viewport
	const pos = listElementRef.value.getBoundingClientRect();
	const windowHeight = window.innerHeight || document.documentElement.clientHeight;
	const windowWidth = window.innerWidth || document.documentElement.clientWidth;
	return {
		x: Math.min(0, listElementOffset.value.x + windowWidth - pos.right),
		y: Math.min(0, listElementOffset.value.y + windowHeight - pos.bottom),
	};
}
function offsetString() {
	return `${listElementOffset.value.x}px, ${listElementOffset.value.y}px`;
}
function startDrag(event: DragEvent, originalIndex: number) {
	if (!event.dataTransfer) return;
	event.dataTransfer.dropEffect = 'move'
	event.dataTransfer.effectAllowed = 'move'
	event.dataTransfer.setData('draggingIndex', originalIndex.toString())
}
function onDrop(event: DragEvent, droppedOnIndex: number) {
	if (!event.dataTransfer) return;
	const draggingIndex = parseInt(event.dataTransfer.getData('draggingIndex'));
	const draggedStatus = props.statusOptions[draggingIndex];
	const newStatusOptions = props.statusOptions;
	newStatusOptions.splice(draggingIndex, 1);
	newStatusOptions.splice(droppedOnIndex, 0, draggedStatus);
	props.reorderStatusOptions(newStatusOptions);
}
onMounted(() => {
	if (props.statusOptions.length === 0) {
		console.warn('No status options supplied to component');
	}
	const debouncedCalculateOffset = debounce(() => listElementOffset.value = calculateOffset(), 10);
	// put selector in viewport if it's outside on window resize
	window.addEventListener("resize", () => {
		if (listElementRef.value) {
			// debouncedCalculateOffset()
		}
	});
	// put selector in viewport if it's outside on scroll
	window.addEventListener("scroll", () => {
		if (listElementRef.value) {
			// debouncedCalculateOffset()
		}
	});
});
watch(listElementRef, (ref) => {
	if (ref) {
		listElementOffset.value = calculateOffset();
	}
});
</script>

<template>
	<div :class="$style.statusComponent">
		<span :class="$style.title">{{ props.title }}</span>
		<div>
			<button
				:class="[$style.statusValue, statusSelectionOpen ? $style.active : '']"
				@click.stop="toggleDropdown"
				@mouseover="labelIsHovered = true"
				@mouseleave="labelIsHovered = false"
			>{{ !labelIsHovered && !statusSelectionOpen ? statusValue.status_name[0] : statusValue.status_name }}</button>
			<div :class="$style.statusListMount">
				<ul
					ref="listElementRef"
					:class="$style.statusList"
					v-if="statusSelectionOpen"
					@dragover.prevent
					@dragenter.prevent
				>
					<li
						v-for="(statusOption, currentIndex) in props.statusOptions"
						:key="statusOption.status_name"
						:class="[$style.status, isStatusActive(statusOption) ? $style.active : '']"
						draggable="true"
						@dragstart="startDrag($event, currentIndex)"
						@drop="onDrop($event, currentIndex)"
						@click.stop="selectStatus(statusOption)"
					>
						<div :class="$style.statusColor" :style="{ backgroundColor: statusOption.color }" />
						<div :class="$style.statusName">{{ statusOption.status_name }}</div>
					</li>
				</ul>
			</div>
		</div>
	</div>
</template>

<style module lang="scss">
[draggable="true"] {
	-khtml-user-drag: element;
}
.statusComponent {
	display: grid;
	grid-template-columns: auto 130px;
	width: 100%;
}
.title {
	width: 15em;
	font-size: v-bind(titleRatio);
}
.statusValue {
	display: flex;
	justify-content: center;
	max-width: 15em;
	box-sizing: border-box;
	border-radius: 4px;
	padding: 2px 0;
	border: 1px solid v-bind("statusValue.color");
	background-color: v-bind("statusValue.color");
	width: 20px;
	color: white;
	transition: background-color 0.15s, padding 0.3s;
	&:hover,
	&.active {
		width: auto;
		max-width: 130px;
		padding: 2px 8px;
	}
	&.active,
	&:hover.active {
		width: auto;
		color: white;
		border: 1px solid transparent;
		background-color: v-bind("statusValue.color");
	}
	&:hover {
		cursor: pointer;
		color: black;
		background-color: transparent;
	}
}
.statusListMount {
	position: relative;
}
.statusList {
	position: absolute;
	background-color: white;
	border-radius: 4px;
	padding: 0;
	box-shadow: 0 0 25px 2px rgb(199, 199, 199);
	width: 160px;
	transform: translate(v-bind(offsetString()));
}
.status {
	display: flex;
	align-items: center;
	box-sizing: border-box;
	min-height: 32px;
	border-left: 2px solid transparent;
	padding: 8px 0;
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
		padding-top: 10px;
		border-radius: 4px 4px 0 0;
	}
	&:last-of-type {
		padding-bottom: 10px;
		border-radius: 0 0 4px 4px;
	}
	&:active {
		transition: 0.1s;
		filter: brightness(95%);
	}
}
.statusColor {
	position: absolute;
	margin-left: 14px;
	height: 12px;
	width: 12px;
	border-radius: 50%;
	border: 2px solid white;
}
.statusName {
	margin-left: 34px;
	padding-right: 5px;
}
</style>
