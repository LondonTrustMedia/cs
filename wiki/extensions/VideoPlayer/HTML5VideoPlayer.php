<?php
// See http://www.mediawiki.org/wiki/Extension:VideoPlayer for more information.

// Notes(doaks): This is a custom HTML5 video player that just puts the right sources in.
// Most videos should contain both mp4 and mkv sources to catch the widest variety of
// browsers out there. Here's an example video tag with this extension:
//
//   <video mp4="https://example.com/vid.mp4" mkv="https://example.com/vid.mkv"></video>

$wgExtensionFunctions[] = 'HTML5VideoPlayer';
$wgExtensionCredits['parserhook'][] = array(
	'name'			=> 'HTML5VideoPlayer',
	'description'	=> 'Display video players for HTML5 video',
	'author'		=> 'Joachim Chauveheid (with heavy modifications from Daniel Oakley)',
	'version'		=> 2.0
);

function HTML5VideoPlayer() {
	global $wgParser;
	$wgParser->setHook('video', 'renderVideoPlayer');
}

function renderVideoPlayer($input, $args) {
    // get video sources
    $mp4source = isset($args['mp4']) ? $args['mp4'] : null;
    $mkvsource = isset($args['mkv']) ? $args['mkv'] : null;

    // assemble output
    $output = '<video style="display: block; margin: 0 auto; max-width: 80%" controls="">';

    if ($mp4source != null) {
        $output .= '<source src="'.$mp4source.'" type="video/mp4">';
    }
    if ($mkvsource != null) {
        $output .= '<source src="'.$mkvsource.'">';
    }

    $output .= '</video>';

    return $output;
}
?>
