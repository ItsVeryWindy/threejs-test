/*global define:false */

define(['jquery', 'block-settings', 'jquery.colorpicker'], function ($, BlockSettings) {
	var toolbar = document.createElement('div');
	
	toolbar.className = 'toolbar';
	
	document.body.appendChild(toolbar);
	
	var colorPicker = document.createElement('div');
	
	colorPicker.id = 'colorSelector';
	
	colorPicker.innerHTML = '<div style="background-color: rgb(255, 255, 255);"></div>';
	
	toolbar.appendChild(colorPicker);
	
	$('#colorSelector').ColorPicker({
		color: '#ffffff',
		onShow: function (colpkr) {
			$(colpkr).fadeIn(500);
			return false;
		},
		onHide: function (colpkr) {
			$(colpkr).fadeOut(500);
			return false;
		},
		onChange: function (hsb, hex, rgb) {
			BlockSettings.Color = parseInt('0x' + hex);
		
			$('#colorSelector div').css('backgroundColor', '#' + hex);
		}
	});
});