<template>

  <div id="share-buttons">
    <h1> Am a Vue Compooonent</h1> 
    <a href="#" @click.prevent="share" v-if="facebook">Facebook</a>
    <a href="#" @click.prevent="share" v-if="twitter">Twitter</a>
    <a href="#" @click.prevent="share" v-if="gplus">Google+</a>
    <div v-for="i in count" :key="i">
      <canvas class="canvas" :id="'canv' + i" :width="canvas_width" :height="canvas_height"></canvas>
    </div>
    
  </div>

</template>

<script>
export default {
  props: {
    facebook: { type: Boolean, default: true },
    twitter: { type: Boolean, default: true },
    gplus: { type: Boolean, de2fault: true }
  },
  data: function(){
    return{
      data: [10,5,10,30],
      colors:["#7E3817", "#C35817", "#EE9A4D", "#A0C544"], 
      curr: 0,
      context: Array,
      canvas_width: 400,
      canvas_height: 300,
      anim_speed: 0.00199
      }
  },
  computed:{
    count:function(){
      return this.data.length + 1;
    }
  },
  methods: {
    share ($event) {
      window.alert('Share on ' + $event.target.innerHTML);
    },

    animate(ctx, center, radius, lastPosition, endAngle){
      var reqID;
      var innerEndAngle = (this.curr * 2*Math.PI) + lastPosition;
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      
      ctx.beginPath();
      ctx.moveTo(center[0],center[1]); 
      ctx.arc(center[0],center[1], radius, lastPosition, innerEndAngle, false); 
      ctx.lineTo(center[0],center[1]);
      ctx.fill();
      ctx.closePath();
      
      reqID = requestAnimationFrame(()=> {this.animate(ctx, center, radius, lastPosition, endAngle)});

      if(((this.curr * 2*Math.PI + lastPosition) >= endAngle)){
        cancelAnimationFrame(reqID);
      ///console.log(".. "+ reqID);   
      }
      if(Math.abs(endAngle - lastPosition) > 2.9){
      //speed up animation
      this.curr += this.anim_speed + 0.0055;
      }
      this.curr += this.anim_speed;        
      },

    drawChart(ctx, center, radius, lastPosition,total){
      var lstPosition = 0;
      for (var i = 0; i < this.data.length; i++) {

        ctx[i].fillStyle = this.colors[i];
        /******* animate the draw **/
        var endAngle = lstPosition + (Math.PI*2*(this.data[i]/total));
        this.curr = 0;
        //console.log("begin: "+ lstPosition+" ,end: "+ endAngle +"color: "+this.colors[i]);
        this.animate(ctx[i], center, radius, lstPosition, endAngle);
        lstPosition = endAngle;
      }
        ctx[this.data.length].fillStyle ="#ffff";
        ctx[this.data.length].beginPath();
        ctx[this.data.length].moveTo(center[0],center[1]); 
        ctx[this.data.length].arc(center[0],center[1],(radius-50),0,(Math.PI*2),false); 
        ctx[this.data.length].fill();
        ctx[this.data.length].closePath();
    },
    updateChart(){
   
      for(i=0; i < this.count;i++){
      this.context[i].clearRect(0, 0, this.canvas_width, this.canvas_height);
      }
      var lastPosition = 0; 
      var  total = 0;
      var center = [this.canvas_width/ 2, this.canvas_height / 2];
      var radius = Math.min(this.canvas_width, this.canvas_height) / 2;
      
      for(var i in this.data) { total += this.data[i]; }
      
      this.drawChart(this.context, center, radius, lastPosition, total);

    }
  },
  mounted(){ 
    var cnt = 0;
    for(i=0; i < this.count;i++){
    cnt++;
    var canvas = document.getElementById("canv"+ cnt);
    var center = [this.canvas_width/ 2, this.canvas_height / 2];
    var radius = Math.min(this.canvas_width, this.canvas_height) / 2;
    this.context[i] = canvas.getContext("2d");
    }
    var lastPosition = 0; 
    var  total = 0;
    
    for(var i in this.data) { total += this.data[i]; }
    
    this.drawChart(this.context, center, radius, lastPosition, total);

    let self = this;
        window.setInterval(() => {
            const newVals = [Math.round(Math.random() * 100), Math.round(Math.random() * 100)];
                  self.data.splice(0, 2, ...newVals);
            }, 3000);
  },
  watch:{
    data:{
      handler: function(dat){
        this.updateChart();
      }, deep:true
    },
  }
  
}
</script>

<style scoped>
  #share-buttons a {
    display: inline-block;
    border: 1px solid #ddd;
    padding: 10px 20px;
    margin-right: 10px;
    text-transform: uppercase;
    color: #999;
    text-decoration: none;
    height: 300px;
  }
  #share-buttons a:hover {
    color: #333;
    border-color: #888;
  }
  .pie {
  width: 100px; height: 100px;
  border-radius: 50%;
  background: conic-gradient(#655 40%, yellowgreen 0);
}
.canvas{
  position: absolute;
}
</style>