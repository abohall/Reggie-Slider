# Reggie-Slider
<p>When I started at my last opportunity, we primarily used jQuery plugins to build our sites. After a few years, we noticed our pages were slower and that our jQuery slider plugin was full of bugs.</p>
<p>This is not that slider. After being released from my job due to the economic impact of COVID-19, I took some time to start re-writing it!</p>
<p>This is a vanilla JavaScript slider. It <strong>can</strong> be dependent free, but I've chosen to use the always awesome 'Font Awesome' for the navigation.</p>
<p>Just a little insight into why I've named this project "The Reggie Slider"...one of the first bugs I encountered with it was when the autoplay function worked a little too well. If you were to mouseover and mouseout of the slider multiple times, it would cause the event to fire multiple times. This caused the slider to just keep going and going...just like the Goldendoodle you'll see in these pictures, Reggie.</p>
<p>This is my first "Open Source" project that I have placed on GitHub. I am actively working on improvements and welcome any feedback or questions!</p>

<h2>Features</h2>
<ul>
  <li>Single Image Slider</li>
  <li>Multiple Image Slider</li>
  <li>Swipe Control</li>
  <li>Auto Slide (based on location of slider in viewport and if you're hovering over the slider or not)</li>
</ul>

<h2>Features to come...</h2>
<ul>
  <li>Lazy Loading Images</li>
  <li>Loading Spinner</li>
  <li>Slide counter</li>
</ul>

<h2>Setup</h2>
Place everything within a template tag
```javascript <template class="reggie-slider-template"></template>
```  
  <p>Everything that is placed in a template tag with the above class will turn into a slider!</p>
  
  <h3>You'll need a few data attributes to make it work.</h3>
  
  ```
  data-id="foo" \\ access public events for previous, next.
  data-arrows="boolean" \\ show or hide navigation. 
  data-auto-slide="boolean" \\ auto slide the player every 5 seconds. Note, auto sliding pauses if the slider is out of view or you mouse over it.
  ```
  

