// client/src/components/AudioFeatureSlider.vue
<script setup lang="ts">
import { computed } from 'vue'
import { featureConfigs } from '@/utils/normalization'

interface Props {
  label: string;
  value: number;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
})

const emit = defineEmits<{
  (e: 'update:value', value: number): void;
}>()

// Feature descriptions from Spotify
const featureDescriptions: Record<string, string> = {
  acousticness: "A confidence measure of whether the track is acoustic. A value of 1.0 represents high confidence the track is acoustic.",
  danceability: "How suitable a track is for dancing based on a combination of musical elements including tempo, rhythm stability, beat strength, and overall regularity.",
  duration_ms: "The duration of the track in seconds.",
  energy: "A measure representing intensity and activity. Typically, energetic tracks feel fast, loud, and noisy. For example, death metal has high energy, while a Bach prelude scores low on the scale.",
  instrumentalness: "Predicts whether a track contains no vocals. The closer the instrumentalness value is to 1.0, the greater likelihood the track contains no vocal content. Values above 0.5 represent instrumental tracks.",
  is_explicit: "Whether or not the track contains explicit lyrics (true = 1, false = 0).",
  key: "The key the track is in. Integers map to pitches using standard Pitch Class notation. E.g. 0 = C, 1 = C♯/D♭, 2 = D, and so on.",
  liveness: "Detects the presence of an audience in the recording. Higher liveness values represent an increased probability that the track was performed live.",
  loudness: "The overall loudness of a track in decibels (dB). Loudness values are averaged across the entire track.",
  mode: "Indicates the modality (major or minor) of a track. Major is represented by 1 and minor is 0.",
  speechiness: "Detects the presence of spoken words in a track. The more exclusively speech-like the recording (e.g. talk show, audio book, poetry), the closer to 1.0 the attribute value.",
  tempo: "The overall estimated tempo of a track in beats per minute (BPM).",
  valence: "A measure describing the musical positiveness conveyed by a track. Tracks with high valence sound more positive (e.g. happy, cheerful, euphoric), while tracks with low valence sound more negative (e.g. sad, depressed, angry)."
}

const formattedLabel = computed(() => {
  return props.label.split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
})

const description = computed(() => {
  return featureDescriptions[props.label] || ''
})

const config = computed(() => featureConfigs[props.label])
const displayValue = computed(() => config.value.format(props.value))
const isExplicit = computed(() => props.label === 'is_explicit')

const handleInput = (event: Event) => {
  if (!(event.target instanceof HTMLInputElement)) return
  const newValue = parseFloat(event.target.value)
  emit('update:value', newValue)
}

const handleExplicitToggle = () => {
  emit('update:value', props.value === 1 ? 0 : 1)
}
</script>

<template>
  <div class="mb-6 group relative" data-cy="audio-features">
    <div class="flex justify-between mb-1">
      <label :for="label" class="text-sm font-medium text-gray-900 dark:text-white">
        {{ formattedLabel }}
      </label>
      <span class="text-sm font-medium text-gray-900 dark:text-white">
        {{ displayValue }}
      </span>
    </div>
    
    <!-- Toggle switch for is_explicit -->
    <div v-if="isExplicit" class="flex items-center">
      <button
        type="button"
        @click="handleExplicitToggle"
        class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out"
        :class="value === 1 ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'"
      >
        <span
          class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out mt-1"
          :class="value === 1 ? 'translate-x-6' : 'translate-x-1'"
        />
      </button>
    </div>
    
    <!-- Range slider and tooltip container -->
    <div class="relative">
      <input 
        v-if="!isExplicit"
        :id="label"
        :data-cy="label"
        type="range"
        :value="value"
        :min="config.min"
        :max="config.max"
        :step="config.step"
        :disabled="disabled"
        @input="handleInput"
        class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
      >

      <!-- Tooltip positioned just below slider -->
      <div class="invisible group-hover:visible absolute top-7 left-0 right-0 mx-auto p-2 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded shadow-lg text-center z-10">
        {{ description }}
        <div class="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Hide tooltip on mobile */
@media (hover: none) {
  .group:hover .invisible {
    visibility: hidden;
  }
}
</style>