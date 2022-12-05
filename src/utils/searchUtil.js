import L from "leaflet";

export function createSearch() {
    L.Control.Search = L.Control.extend({
        onAdd: function (map) {
            this._div = document.getElementById("search")
            return this._div;
        }
    })

    return new L.Control.Search({position: "topleft"}).addTo(map);
}

export function searchCounties() {
    if (searchTerm.value.length === 0) {
        return filteredCounties.value = [];
    }

    let matches = 0;

    filteredCounties.value = searchData.filter(county => {
        if (county.properties.name.toLowerCase().startsWith(searchTerm.value.toLowerCase()) && matches < 10) {
            matches++;
            if (searchTerm.value.toLowerCase() === county.properties.name.toLowerCase()) {
                filteredCounties.value = []
                return filteredCounties.value = [];
            }
            selectedCountyIndex.value = "";
            return county;
        }
    })
}

export function selectNextCounty(ev) {
    if (selectedCountyIndex.value === "") {
        selectedCountyIndex.value = 0;
    } else {
        selectedCountyIndex.value++;
    }

    if (selectedCountyIndex === filteredCounties.value.length) {
        selectedCountyIndex = 0;
    }

    if (selectedCountyIndex.value > filteredCounties.value.length - 1) {
        selectedCountyIndex.value = filteredCounties.value.length - 1;
    }

    focusItem(ev);
}

export function selectPreviousCounty(ev) {
    if (selectedCountyIndex.value === "") {
        selectedCountyIndex.value = filteredCounties.value.length - 1;
    } else {
        selectedCountyIndex.value--;
    }

    if (selectedCountyIndex.value < 0) {
        selectedCountyIndex.value = 0;
        let inputField = document.getElementById("searchInput");
        window.setTimeout(function () {
            inputField.setSelectionRange(0, inputField.value.length)
            inputField.focus()
        }, 0);
        return
    }
    focusItem(ev);
}

export function focusItem(ev) {
    if (filteredCounties.value.length > 0) {
        let selectedCounty = document.getElementsByClassName("county").item(selectedCountyIndex.value);
        selectedCounty.focus();
    }
}

export function selectCounty(ev) {
    // countiesMap.toGeoJSON().features.find(value => value.feature.properties.AGS === ev.target.id)
    let county = countiesMap.getLayers().find(value => value.feature.properties.AGS === ev.target.id);
    map.fitBounds(county.getBounds());
    county.setStyle({
        fillColor: "red",
        weight: 2,
        opacity: 1,
        color: 'black',
        dashArray: '3',
        fillOpacity: 0.7
    });
    searchTerm.value = ev.target.innerText;
    filteredCounties.value = [];
}