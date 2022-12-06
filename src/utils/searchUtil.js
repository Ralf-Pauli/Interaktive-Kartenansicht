import L from "leaflet";
import {getSearchData} from "@/utils/geoJsonHandler";

let searchControl,
    filteredCounties = [];

let selectedCountyIndex;

export function createSearch(map) {
    L.Control.Search = L.Control.extend({
        onAdd: function (map) {
            this._div = document.getElementById("search")
            return this._div;
        }
    })

    searchControl = new L.Control.Search({position: "topleft"}).addTo(map);
}

export function searchCounties(searchTerm) {
    if (searchTerm.length === 0) {
        return filteredCounties = [];
    }

    let matches = 0;

    filteredCounties = getSearchData().filter(county => {
        if (county.properties.name.toLowerCase().startsWith(searchTerm.toLowerCase()) && matches < 10) {
            matches++;
            if (searchTerm.toLowerCase() === county.properties.name.toLowerCase()) {
                filteredCounties = []
                return filteredCounties = [];
            }
            selectedCountyIndex = "";
            return county;
        }
    })
}

export function selectNextCounty(ev) {
    if (selectedCountyIndex === "") {
        selectedCountyIndex = 0;
    } else {
        selectedCountyIndex++;
    }

    if (selectedCountyIndex === filteredCounties.length) {
        selectedCountyIndex = 0;
    }

    if (selectedCountyIndex > filteredCounties.length - 1) {
        selectedCountyIndex = filteredCounties.length - 1;
    }

    focusItem(ev);
}

export function selectPreviousCounty(ev) {
    if (selectedCountyIndex === "") {
        selectedCountyIndex = filteredCounties.length - 1;
    } else {
        selectedCountyIndex--;
    }

    if (selectedCountyIndex < 0) {
        selectedCountyIndex = 0;
        let inputField = document.getElementById("searchInput");
        window.setTimeout(function () {
            inputField.setSelectionRange(0, inputField.length)
            inputField.focus()
        }, 0);
        return
    }
    focusItem(ev);
}

export function focusItem(ev) {
    if (filteredCounties.length > 0) {
        let selectedCounty = document.getElementsByClassName("county").item(selectedCountyIndex);
        selectedCounty.focus();
    }
}

// export function selectCounty(ev) {
//     // countiesMap.toGeoJSON().features.find(value => value.feature.properties.AGS === ev.target.id)
//     let county = countiesMap.getLayers().find(value => value.feature.properties.AGS === ev.target.id);
//     map.fitBounds(county.getBounds());
//     county.setStyle({
//         fillColor: "red",
//         weight: 2,
//         opacity: 1,
//         color: 'black',
//         dashArray: '3',
//         fillOpacity: 0.7
//     });
//     searchTerm = ev.target.innerText;
//     filteredCounties = [];
// }

export function getSelectedCountyIndex() {
    return selectedCountyIndex
}

export  function getFilteredCounties() {
    return filteredCounties;
}