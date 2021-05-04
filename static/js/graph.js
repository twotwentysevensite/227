function weight(fields, date=new Date()) {
	if (fields.sample != null)
		sample = fields.sample/1500
	else
		sample = 0.5
	
	day_dif = (date - new Date(fields.date))/(1000 * 60 * 60 * 24)
	if (day_dif < 75) {
		recent = 1/Math.pow(day_dif+1, 2.5)
	} else {
		recent = 0
	}
	
	
	add = 1
	
	if (fields.firm == "Newspoll") {
		add = 0.7
	}
	
	final_weight = Math.pow(add*sample*recent, 0.2)
	
	return final_weight
	
}

function weighted_average(input, weights) {
	if (input.length != weights.length) {
		return "Error: different array lengths"
	} else {
		input_sum = 0
		weight_sum = 0
		for (n = 0; n < input.length; n++) {
			input_sum += input[n] * weights[n]
			weight_sum += weights[n]
		}
		av = input_sum/weight_sum
		return av
	}
}

$.getJSON("static/json/national_polling.json", function(json) {
	console.log(json)
	
	dateset = []
	r_polled = [[], []]
	polled = [[], []]
	
	for (i = 0; i < json.length; i++) {
		dateset.push(new Date(json[i].date))
		
		LNP = json[i].LNP
		ALP = json[i].ALP
		UND = json[i].UND
		
		if (UND > 0) {
			sum = ALP + LNP
			LNP = Math.round((LNP/sum)*10000)/100
			ALP = Math.round((ALP/sum)*10000)/100
		}
		
		poll_weights = []
		
		for (y = 0; y <= r_polled[0].length; y++) {
			weighted = weight(json[y], new Date(json[i].date))
			poll_weights.push(weighted)
		}
		
		r_polled[0].push(LNP)
		r_polled[1].push(ALP)
		
		LNP = Math.round(weighted_average(r_polled[0], poll_weights)*100)/100
		ALP = Math.round(weighted_average(r_polled[1], poll_weights)*100)/100
		
		polled[0].push(LNP)
		polled[1].push(ALP)
	}
	
	var trace1 = {
		name: "LNP",
		line: {color: '#1003c1'},
		x: dateset,
		y: polled[0],
		type: 'scatter'
	};
	
	var trace2 = {
		name: "ALP",
		line: {color: '#e00000'},
		x: dateset,
		y: polled[1],
		type: 'scatter'
	};

	var data = [trace1, trace2];
	
	$("#LNP_final")[0].innerText = trace1.y[trace1.y.length - 1]+"%"
	$("#ALP_final")[0].innerText = trace2.y[trace2.y.length - 1]+"%"
	
	Plotly.newPlot('pollingChart', data, {title: 'National Two-Party Preferred', wdith: 100, height: 500, autosize: false, automargin: true}, {displayModeBar: false});
})


