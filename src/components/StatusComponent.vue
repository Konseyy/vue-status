<script setup lang="ts">
import type { status } from '@/library/types';
import { computed, onMounted, ref, watch } from 'vue';

const props = defineProps<{
	title: string;
	titleRatio?: number;
	startingStatus: status;
	statusOptions: status[];
}>();
const emit = defineEmits<{
	(event: "status-changed", newStatus: string): void;
	(event: "status-reordered", newOptions: status[]): void;
}>();
const statusSelectionOpen = ref(false);
const statusValue = ref<status>(props.startingStatus);
const labelIsHovered = ref(false);
const listElementRef = ref<HTMLElement | null>(null);
const listElementOffset = ref<{ x: number; y: number }>({ x: 0, y: 0 });
const titleRatio = computed(() => `${props.titleRatio ?? 1}em`);

function debounce(func: Function, timeout: number,) {
	// standart debounce implementation
	let timer: number
	return (...args: any[]) => {
		clearTimeout(timer)
		timer = setTimeout(() => {
			func(...args)
		}, timeout)
	}
}
function toggleDropdown() {
	// status list open toggle handler
	statusSelectionOpen.value = !statusSelectionOpen.value;
	if (statusSelectionOpen.value) {
		// if opening dropdown, close previously opened dropdown, and add new dropdown close method to window object 
		if (window.closeLastOpened) {
			window.closeLastOpened();
		}
		window.closeLastOpened = function () {
			statusSelectionOpen.value = false;
			window.closeLastOpened = undefined;
		};
		window.addEventListener(
			'click',
			() => {
				if (window.closeLastOpened) {
					window.closeLastOpened();
				}
			},
			{ once: true }
		);
	} else {
		// if closing dropdown, remove dropdown close method from window object
		window.closeLastOpened = undefined;
	}
}

async function selectStatus(status: status) {
	// status change handler
	statusValue.value = status;
	statusSelectionOpen.value = false;
	window.closeLastOpened = undefined;
	emit("status-changed", status.status_id);
}
function calculateOffset() {
	// calculate offset to prevent dropdown from rendering outside viewport
	if (!listElementRef.value) return { x: 0, y: 0 };
	const pos = listElementRef.value.getBoundingClientRect();
	const windowHeight = window.innerHeight || document.documentElement.clientHeight;
	const windowWidth = window.innerWidth || document.documentElement.clientWidth;
	return {
		x: Math.min(0, listElementOffset.value.x + windowWidth - pos.right),
		y: Math.min(0, listElementOffset.value.y + windowHeight - pos.bottom),
	};
}
const calculatedOffset = computed(() => {
	const newOffset = calculateOffset();
	return `${newOffset.x}px, ${newOffset.y}px`
});

function startDrag(event: DragEvent, originalIndex: number) {
	// status option start drag handler
	if (!event.dataTransfer) return;
	event.dataTransfer.dropEffect = 'move'
	event.dataTransfer.effectAllowed = 'move'
	event.dataTransfer.setData('draggingIndex', originalIndex.toString())
}
function onDrop(event: DragEvent, droppedOnIndex: number) {
	// status option drop handler
	if (!event.dataTransfer) return;
	const draggingIndex = parseInt(event.dataTransfer.getData('draggingIndex'));
	const draggedStatus = props.statusOptions[draggingIndex];
	const newStatusOptions = props.statusOptions;
	newStatusOptions.splice(draggingIndex, 1);
	newStatusOptions.splice(droppedOnIndex, 0, draggedStatus);
	emit("status-reordered", newStatusOptions);
}
onMounted(() => {
	if (props.statusOptions.length === 0) {
		console.warn('No status options supplied to component');
	}
	const debouncedCalculateOffset = debounce(() => listElementOffset.value = calculateOffset(), 10);
	window.addEventListener("resize", () => {
		// put dropdown in viewport if it's outside on window resize
		if (listElementRef.value) {
			// debouncedCalculateOffset()
		}
	});
	window.addEventListener("scroll", () => {
		// put dropdown in viewport if it's outside on scroll
		if (listElementRef.value) {
			// debouncedCalculateOffset()
		}
	});
});
</script>

<template>
	<div :class="$style.statusComponent">
		<span :class="$style.title">{{ props.title }}</span>
		<div :class="$style.dropdownContainer">
			<button :class="[$style.statusValue, statusSelectionOpen ? $style.active : '']" @click.stop="toggleDropdown"
				@mouseover="labelIsHovered = true" @mouseleave="labelIsHovered = false">{{
					!labelIsHovered &&
						!statusSelectionOpen ? statusValue.status_name[0] : statusValue.status_name
				}}</button>
			<div :class="$style.statusListMount">
				<ul ref="listElementRef" :class="$style.statusList" v-if="statusSelectionOpen" @dragover.prevent
					@dragenter.prevent>
					<li v-for="(statusOption, currentIndex) in props.statusOptions" :key="statusOption.status_name"
						:class="[$style.status, statusOption.status_id === statusValue.status_id ? $style.active : '']"
						draggable="true" @dragstart="startDrag($event, currentIndex)" @drop="onDrop($event, currentIndex)"
						@click.stop="selectStatus(statusOption)">
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
	grid-template-columns: minmax(0, 1fr) 130px;
	width: 100%;
}

.title {
	font-size: v-bind(titleRatio);
}

.dropdownContainer {
	display: flex;
	flex-direction: column;
	justify-self: end;
}

.statusValue {
	align-self: flex-end;
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
	user-select: none;
	transition: background-color 0.2s, padding 0.5s;

	@media (hover: none) {
		transition: 0s;
	}

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
		background-color: white;
	}
}

.statusListMount {
	position: relative;
}

.statusList {
	position: absolute;
	background-color: white;
	border-radius: 4px;
	overflow: hidden;
	padding: 0;
	box-shadow: 0px 2px 6px rgba(31, 34, 38, 0.08),
		0px 8px 32px rgba(31, 34, 38, 0.12);
	width: 160px;
	transform: translate(v-bind(calculatedOffset));
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
	}

	&:last-of-type {
		padding-bottom: 10px;
	}

	&:active {
		transition: 0.1s;
		filter: brightness(95%);
	}
}

.statusColor {
	position: absolute;
	box-sizing: content-box;
	margin-left: 12px;
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
