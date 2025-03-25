// client/src/views/HomeView.vue
<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'
import AudioFeatureSlider from '@/components/AudioFeatureSlider.vue'
import ResponseChart from '@/components/ResponseChart.vue'
import { featureConfigs } from '@/utils/normalization'
import { songPresets, type SongPreset } from '@/utils/songPresets'
import WorldMapView from '@/components/WorldMapView.vue'
import { featureFlags } from '@/utils/featureFlags';

const audioFeatures = ref({
  is_explicit: 0,
  duration_ms: 237000,
  danceability: 0.735,
  energy: 0.578,
  key: 5,
  loudness: -11.84,
  mode: 0,
  speechiness: 0.0461,
  acousticness: 0.514,
  instrumentalness: 0.0902,
  liveness: 0.0817,
  valence: 0.624,
  tempo: 98.002
})

const orderedFeatures = [
  'is_explicit',
  'duration_ms',
  'danceability',
  'energy',
  'key',
  'loudness',
  'mode',
  'speechiness',
  'acousticness',
  'instrumentalness',
  'liveness',
  'valence',
  'tempo'
] as const

const updateFeature = (feature: keyof typeof audioFeatures.value, value: number) => {
  audioFeatures.value[feature] = value
}

const loadPreset = (preset: SongPreset) => {
  // Update all features from the preset
  orderedFeatures.forEach(feature => {
    audioFeatures.value[feature] = preset[feature]
  })
}

const probabilities = ref<number[]>([])
const countryCodes = ref<string[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

const showLocation = async () => {
  const createFeatureInput = (name: string, value: number) => ({
    name,
    shape: [1, 1],
    datatype: "FP32",
    data: [value]
  })

  const featureInputs = orderedFeatures.map(feature => {
    const value = audioFeatures.value[feature]
    const config = featureConfigs[feature]
    return createFeatureInput(feature, Number(config.normalize(value).toFixed(4)))
  })

  const requestBody = {
    inputs: featureInputs
  }

  try {
    isLoading.value = true
    error.value = null
    
    const response = await axios.post('/api/v2/models/jukebox/infer', requestBody)
    
    if (response.data?.outputs) {
      probabilities.value = response.data.outputs[0].data
      countryCodes.value = response.data.outputs[1].data
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An error occurred'
    console.error('Inference Error:', err)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto px-4">

    <!-- Warning banner when feature flag is enabled -->
    <div 
      v-if="featureFlags.searchAsDefault" 
      class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded"
      role="alert"
    >
      <div class="flex items-center">
        <svg class="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
        </svg>
        <span class="font-medium">Warning:</span>&nbsp;This API is disabled when using the Feast Endpoint
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Left Column - Controls -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">Audio Features</h2>
          <button
            data-cy="show-location-btn"
            @click="showLocation"
            :disabled="isLoading"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="isLoading">Processing...</span>
            <span v-else>Show Location</span>
          </button>
        </div>

        <!-- Preset Buttons -->
        <div class="mb-6 space-y-2">
          <div class="font-medium text-gray-700 dark:text-gray-300 mb-2">Presets:</div>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="preset in songPresets"
              :key="preset.name"
              @click="loadPreset(preset)"
              class="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
            >
              {{ preset.name }} - {{ preset.artist }}
            </button>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {{ error }}
        </div>

        <!-- Sliders -->
        <div class="space-y-6">
          <AudioFeatureSlider
            v-for="feature in orderedFeatures"
            :key="feature"
            :label="feature"
            :value="audioFeatures[feature]"
            @update:value="(value) => updateFeature(feature, value)"
          />
        </div>
      </div>

      <!-- Right Column - Results -->
      <div class="space-y-6">
        <!-- Results Chart -->
        <div v-if="probabilities.length && countryCodes.length" class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">Response Distribution</h2>
          <ResponseChart 
            :data="probabilities"
            :country-codes="countryCodes"
          />
        </div>
        
        <!-- World Map (Below Chart) -->
        <div v-if="probabilities.length && countryCodes.length" class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">Global Popularity</h2>
          <WorldMapView
            :probabilities="probabilities"
            :country-codes="countryCodes"
          />
        </div>
      </div>
    </div>
  </div>
</template>