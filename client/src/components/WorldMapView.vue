// client/src/components/WorldMapView.vue
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { countryNames } from '@/utils/countryNames'

// Map library imports
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

interface Props {
  probabilities: number[];
  countryCodes: string[];
}

const props = defineProps<Props>()
const mapContainer = ref<HTMLElement | null>(null)
let map: L.Map | null = null
let geojson: L.GeoJSON | null = null
let legend: L.Control | null = null
const isLoading = ref(true)



onMounted(async () => {
  if (!mapContainer.value) return
  
  // Initialize the map
  map = L.map(mapContainer.value).setView([20, 0], 2)
  
  // Add tile layer (base map)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map)
  
  // Load world boundaries GeoJSON
  try {
    const response = await fetch('/api/refdata/world.geojson')
    const worldData = await response.json()
    isLoading.value = false
    
    if (props.probabilities.length && props.countryCodes.length) {
      renderChoropleth(worldData)
    }
  } catch (error) {
    console.error('Failed to load map data:', error)
    isLoading.value = false
  }
})

// Watch for changes in the data props
watch(() => [props.probabilities, props.countryCodes], ([newProbs, newCodes]) => {
  if (map && newProbs.length && newCodes.length) {
    fetch('/api/refdata/world.geojson')
      .then(res => res.json())
      .then(worldData => {
        renderChoropleth(worldData)
      })
  }
}, { deep: true })

const renderChoropleth = (worldData: any) => {
  if (!map) return
  
  // Create a map of country code to probability
  const countryData: Record<string, number> = {}
  props.countryCodes.forEach((code, index) => {
    countryData[code] = props.probabilities[index]
  })
  
  // Remove existing layer if present
  if (geojson) {
    map.removeLayer(geojson)
  }
  
  // Define style function based on probability values
  const style = (feature: any) => {
    const code = feature.properties.iso_a2
    const probability = countryData[code] || 0
    
    return {
      fillColor: getColor(probability),
      weight: 1,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.7
    }
  }
  
  // Add interactions
  const highlightFeature = (e: L.LeafletEvent) => {
    const layer = e.target
    
    layer.setStyle({
      weight: 3,
      color: '#666',
      dashArray: '',
      fillOpacity: 0.7
    })
    
    layer.bringToFront()
  }
  
  const resetHighlight = (e: L.LeafletEvent) => {
    geojson?.resetStyle(e.target)
  }
  
  const onEachFeature = (feature: any, layer: L.Layer) => {
    const code = feature.properties.iso_a2
    const probability = countryData[code] || 0
    const name = countryNames[code] || feature.properties.name
    
    layer.bindPopup(`<strong>${name}</strong><br>Popularity: ${(probability * 100).toFixed(2)}%`)
    
    layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight,
      click: (e) => {
        map?.fitBounds(e.target.getBounds())
      }
    })
  }
  
  // Add the GeoJSON layer
  geojson = L.geoJSON(worldData, {
    style,
    onEachFeature
  }).addTo(map)
  
  // Add legend
  addColorLegend()
}

const addColorLegend = () => {
  if (!map) return
  
  // Remove existing legend if present
  const existingLegend = document.querySelector('.legend-control')
  if (existingLegend) {
    existingLegend.remove()
  }
  
  // Create a custom legend div
  const legendDiv = document.createElement('div')
  legendDiv.className = 'legend-control'
  
  // Create legend content
  // let legendContent = '<h4>Popularity</h4><div class="legend-gradient" style="">'
  let legendContent = ''
  
  // Add color gradient steps
  const steps = [1, 0.8, 0.6, 0.4, 0.2, 0.1, 0.05, 0.01, 0];
  for (let i = 0; i < steps.length; i++) {
    const value = steps[i]
    legendContent += `<div class="color-step" style="background-color: ${getColor(value)}; text-align: center"> ${Math.ceil(value*100)}% </div>`
  }
  
  // legendContent += '</div><div class="legend-labels"><span>0%</span><span>100%</span></div>'
  
  legendDiv.innerHTML = legendContent
  
  // Add the legend to the map
  const legendControl = L.control({ position: 'bottomright' })
  legendControl.onAdd = () => {
    return legendDiv
  }
  
  legendControl.addTo(map)
}

// Color function - returns color based on probability
const getColor = (probability: number) => {
  return probability >= 1 ? '#3B000A' :
         probability >= 0.8 ? '#800026' :
         probability >= 0.6 ? '#BD0026' :
         probability >= 0.4 ? '#E31A1C' :
         probability >= 0.2 ? '#FC4E2A' :
         probability >= 0.1 ? '#FD8D3C' :
         probability >= 0.05 ? '#FEB24C' :
         probability >= 0.01 ? '#FED976' :
                          '#FFEDA0'
}
</script>

<template>
  <div class="relative">
    <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 z-10">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
    <div ref="mapContainer" class="h-96 rounded-lg overflow-hidden"></div>
  </div>
</template>

<style scoped>
.info {
  padding: 8px 10px;
  font: 14px/16px Arial, Helvetica, sans-serif;
  background: white;
  background: rgba(255,255,255,0.8);
  box-shadow: 0 0 15px rgba(0,0,0,0.2);
  border-radius: 5px;
}

.legend-control {
  padding: 10px;
  background: white;
  background: rgba(255,255,255,0.8);
  box-shadow: 0 0 15px rgba(0,0,0,0.2);
  border-radius: 5px;
  width: 200px;
}

.legend-control h4 {
  margin: 0 0 8px;
  color: #555;
  font-weight: bold;
  text-align: center;
}

.legend-gradient {
  display: flex;
  height: 20px;
  margin-bottom: 5px;
  border-radius: 3px;
  overflow: hidden;
}

.color-step {
  flex: 1;
}

.legend-labels {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #555;
}

@media (prefers-color-scheme: dark) {
  .legend-control {
    background: rgba(50, 50, 50, 0.8);
    color: #eee;
  }
  
  .legend-control h4 {
    color: #ddd;
  }
  
  .legend-labels {
    color: #ccc;
  }
}
</style>