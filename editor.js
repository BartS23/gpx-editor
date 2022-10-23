function getDuration(segment) {
	var points = segment.filter(point => point.enabled);
	var start = points.at(0) || { time: 0 };
	var end = points.at(-1) || { time: 0 };

	var duration = end.time - start.time;

	var hour = Math.floor(duration / (60 * 60));
	duration -= hour * (60 * 60);
	var minute = Math.floor(duration / 60);
	duration -= minute * 60;
	var seconds = duration;

	return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function getDistance(segment) {
	var points = segment.filter(point => point.enabled);
	var lastPoint = points[0];
	var distance = 0;
	points.forEach(point => {
		distance += calcDistance(lastPoint, point);
		lastPoint = point;
	});

	return distance;
}

function getSegment(pts) {
	var segment = [pts[0]];
	segment[0].enabled = true;
	var i = 0;
	var j = 1;
	var len = pts.length;

	for (; j < len; i += 1, j += 1) {
		var pt1 = pts[i];
		var pt2 = pts[j];
		var distance = calcDistance(pt1, pt2);
		pt2.distance = distance;
		pt2.enabled = true;
		segment.push(pt2);
	}

	return segment;
}

function drawPoints(elementId, segment) {
	var $tbody = $('tbody', document.getElementById(elementId));
	$tbody.html('');

	segment.forEach(function (point, index) {
		$tbody.append($('<tr data-toggle-point></tr>')
			.attr('data-segment-id', index)
			.append(`<td class="text-center">${index}</td>`)
			.append(`<td class="text-center"><input class="form-check-input" type="checkbox" id="checkboxNoLabel" ${point.enabled ? 'checked' : ''}></td>`)
			.append(`<td>+ ${point.distance ? point.distance.toFixed(0) : 0} m</td>`)
		);
		lastPoint = point;
	});

	$tbody.parent("table").DataTable().columns.adjust();
}

function generateDataLink(data) {
	return 'data:application/gpx+xml;charset=utf-8,' + encodeURIComponent(data);
}

function initUI(gpxInput) {
	const map = L.map('lf-map');
	L.tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors',
		maxZoom: 19
	}).addTo(map);

	const polyline = L.polyline([], {
		color: '#e41a1c',
		weight: 6
	}).addTo(map);

	$('#input').hide();
	$('#points-table').DataTable({
		paging: false,
		scrollY: 400,
		"ordering": false,
		info: false,
		searching: false,
	});

	$('#editor').show();

	var points = parseGpx(gpxInput);
	var segment = getSegment(points);

	$('#download-gpx').on('click', function () {
		$('#download-gpx').attr('href', generateDataLink(updateGpx(gpxInput, segment)));
	})

	drawPoints("points-table", segment);

	function refreshUi(fitToMap) {
		jQuery("#distance").val(getDistance(segment).toFixed(0) + ' m');
		jQuery("#time").val(getDuration(segment));

		polyline.setLatLngs(segment.filter(point => point.enabled).map(p => [p.lat, p.lon]));

		if (fitToMap) {
			map.fitBounds(polyline.getBounds());
		}
	}

	$('body').on('click', '[data-toggle-point]', function () {
		var $this = $(this);
		var pointId = $this.attr('data-segment-id');
		segment[pointId].enabled = $this.find("input")[0].checked = !segment[pointId].enabled;

		refreshUi(false);
	});

	refreshUi(true);
}

$('#input-gpx').on('change', function (ev) {
	var file = ev.target.files[0];
	var reader = new FileReader();
	reader.readAsText(file);
	reader.onload = function () {
		initUI(reader.result);
	};
});
//jQuery.ajax("Test.gpx").then(data => initUI(data));