// const overpassUrl = "https://overpass-api.de/api/interpreter";

// const overpassQuery = `
// [out:json][timeout:25];
// (
//   way["highway"~"^(motorway|trunk|primary|secondary|tertiary|unclassified|residential|motorway_link|trunk_link|primary_link|secondary_link|tertiary_link|living_street|service)$"](37.7749,-122.4194,37.7779,-122.4164);
//   node(w);
// );
// out body;
// `;

// const url = `${overpassUrl}?data=${encodeURIComponent(overpassQuery)}`;

// fetch(url)
//   .then(response => {
//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }
//     return response.json();
//   })
//   .then(data => {
//     console.log(data);
//     console.log(`Total elements: ${data.elements.length}`);
    
//     let totalNodes = 0;
//     let totalEdges = 0;
//     let oneWayYES = 0
//     let oneWayNO = 0
//     for(let element of data.elements){
//       if(element.type == 'node') totalNodes++;
//       if(element.type == 'way') {
//         if(element.tags.oneway){
//           if(element.tags.oneway == 'yes') oneWayYES++
//           if(element.tags.oneway == 'no') oneWayNO++
//         }
//         totalEdges++;
//       }

//     }
//     console.log(`Nodos: ${totalNodes}, Ways: ${totalEdges}`);
//     console.log(`oneWayYES: ${oneWayYES}, oneWayNO: ${oneWayNO}`);
//   })
//   .catch(error => {
//     console.error("Error fetching data:", error);
//   });