<template>
  <div class="container">
    <div class="controls">
      <button @click="fetchData" class="fetch-button" :disabled="isLoading">
        {{ isLoading ? 'Fetching...' : 'Fetch Data' }}
      </button>
      <button @click="downloadCSV" class="download-button" :disabled="!sensorData.length">
        Download CSV
      </button>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-if="sensorData.length" class="table-container">
      <table>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Received Time</th>
            <th>BMP Temp (°C)</th>
            <th>DHT Temp (°C)</th>
            <th>Distance (m)</th>
            <th>Humidity (%)</th>
            <th>Pressure (hPa)</th>
            <th>RSSI</th>
            <th>SNR</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(data, index) in sensorData" :key="index">
            <td>{{ data.timestamp }}</td>
            <td>{{ data.received_datetime }}</td>
            <td>{{ data.bmp_temp }}</td>
            <td>{{ data.dht_temp }}</td>
            <td>{{ data.distance }}</td>
            <td>{{ data.humidity }}</td>
            <td>{{ data.pressure }}</td>
            <td>{{ data.rssi }}</td>
            <td>{{ data.snr }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get } from 'firebase/database';

export default {
  name: 'DownloadButton',
  data() {
    return {
      firebaseConfig: {
        databaseURL: "https://major-project-d3e48-default-rtdb.asia-southeast1.firebasedatabase.app/"
      },
      sensorData: [],
      isLoading: false,
      error: null
    }
  },
  methods: {
    async fetchData() {
      this.isLoading = true;
      this.error = null;
      try {
        const app = initializeApp(this.firebaseConfig);
        const database = getDatabase(app);
        const dbRef = ref(database);
        
        const snapshot = await get(dbRef);
        const data = snapshot.val();
        
        // Flatten the data structure
        this.sensorData = [];
        if (data && data.sensor_data) {
          Object.values(data.sensor_data).forEach(batch => {
            Object.values(batch).forEach(reading => {
              this.sensorData.push(reading);
            });
          });
        }
        
        // Sort by timestamp
        this.sensorData.sort((a, b) => a.timestamp - b.timestamp);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        this.error = 'Error fetching data. Please check console for details.';
      } finally {
        this.isLoading = false;
      }
    },
    
    downloadCSV() {
      if (!this.sensorData.length) return;
      
      const headers = [
        'Timestamp',
        'Received Time',
        'BMP Temp (°C)',
        'DHT Temp (°C)',
        'Distance (m)',
        'Humidity (%)',
        'Pressure (hPa)',
        'RSSI',
        'SNR'
      ];
      
      const csvContent = [
        headers.join(','),
        ...this.sensorData.map(data => [
          data.timestamp,
          data.received_datetime,
          data.bmp_temp,
          data.dht_temp,
          data.distance,
          data.humidity,
          data.pressure,
          data.rssi,
          data.snr
        ].join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sensor_data.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  }
}
</script>

<style scoped>
.container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.controls {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  justify-content: center;
}

.fetch-button, .download-button {
  padding: 10px 20px;
  font-size: 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.fetch-button {
  background-color: #2196F3;
  color: white;
}

.fetch-button:hover:not(:disabled) {
  background-color: #1976D2;
}

.fetch-button:disabled {
  background-color: #BDBDBD;
  cursor: not-allowed;
}

.download-button {
  background-color: #4CAF50;
  color: white;
}

.download-button:hover:not(:disabled) {
  background-color: #45a049;
}

.download-button:disabled {
  background-color: #BDBDBD;
  cursor: not-allowed;
}

.error-message {
  color: #f44336;
  margin-bottom: 20px;
  text-align: center;
}

.table-container {
  overflow-x: auto;
  margin-top: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background-color: #f5f5f5;
  font-weight: bold;
}

tr:hover {
  background-color: #f5f5f5;
}
</style> 