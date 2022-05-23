var XML_HEADER = '<?xml version="1.0" encoding="UTF-8"?>';

function parseGpx(gpxData) {
	return $($.parseXML(gpxData)).find('trkpt').map(function () {
		var $pt = $(this);
		var pt = {
			lat: $pt.attr('lat'),
			lon: $pt.attr('lon'),
			time: Date.parse($pt.find('time').text()) / 1000,
			ele: $pt.find('ele').text()
		};
		return [pt];
	}).get();
}

function updateGpx1(gpxData, segments) {
	var $gpx = $($.parseXML(gpxData));

	var $trk = $('<trk></trk>');
	segments.forEach(function (segment) {
		if (!segment.enabled) {
			return;
		}
		var $seg = $('<trkseg>');
		for (var i = 0, len = segment.length; i < len; i += 1) {
			var pt = segment[i];
			var $pt = $('<trkpt></trkpt>');
			$pt.attr('lat', pt.lat);
			$pt.attr('lon', pt.lon);
			if (pt.ele) {
				$pt.append($('<ele></ele>').text(pt.ele));
			}
			$pt.append($('<time></time>').text(new Date(pt.time * 1000).toISOString()));
			$seg.append($pt);
		}
		$trk.append($seg);
	});

	$gpx.find('trk').replaceWith($trk);

	return XML_HEADER + $gpx.find('gpx')[0].outerHTML;
}

function updateGpx(gpxData, segment) {
	var $gpx = $($.parseXML(gpxData));

	var $trk = $('<trk />').append("\n");
	var $seg = $("<trkseg />").append("\n");
	segment.filter(point => point.enabled).forEach(point => {
		var $pt = $('<trkpt />').append("\n");
		$pt.attr('lat', point.lat);
		$pt.attr('lon', point.lon);
		if (point.ele) {
			$pt.append($("<ele />").text(point.ele)).append("\n");
		}
		$pt.append($('<time />').text(new Date(point.time * 1000).toISOString())).append("\n");
		$seg.append($pt).append("\n");
	})
	$trk.append($seg).append("\n");
	$gpx.find('trk').replaceWith($trk);

	return XML_HEADER + $gpx.find('gpx')[0].outerHTML;
}
