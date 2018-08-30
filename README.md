# Links
https://vueschool.io/courses/vuex-for-everyone#disqus_thread

https://codepen.io/Stephanie_Cunnane/pen/Jbdgk

https://www.youtube.com/watch?v=LjF9IqvXDjY

https://blog.yojimbocorp.com/2012/01/17/creating-a-simple-pie-chart-with-html5-canvas/

http://www2.fct.unesp.br/docentes/carto/ivanova/workshops/Modern%20Web-Cartography/HTML5%20Graphing%20and%20Data%20Visualization%20Cookbook%20%5BeBook%5D.pdf

https://stackoverflow.com/questions/41164672/whats-the-equivalent-of-angular-service-in-vuejs
https://laracasts.com/discuss/channels/vue/vue-add-a-service-to-the-app-or-component
https://vuejsfeed.com/blog/vue-i18n-implementing-translations-in-vue-js
https://alligator.io/vuejs/using-filters/

Watch me shit
https://www.npmjs.com/package/vue-typescript

https://confluence.atlassian.com/bitbucket/set-up-an-ssh-key-728138079.html

https://www.youtube.com/watch?v=TCcWwUgQe8s

https://vuejsdevelopers.com/2018/05/21/vue-js-web-component/

https://alligator.io/vuejs/custom-elements/

for Kuka mobile plug in

<template>
    <div>
        Battery
        <KukaGauge :level ="level" : title="title" :configuration ="configuration"/>
    </div>
</template>

<script>
import KukaGauge from '../../../controls/KukaGauge.vue';
const configuration = {
        width: 160,
        height: 85, // height is set to atleast half of the width for best results
        showNeedle: false,
        ranges: [
          { lowerBound: 0, upperBound: 10, color: '#CF2027', icon: icon1 },
          { lowerBound: 11, upperBound: 25, color: '#FF5800', icon: icon2 },
          { lowerBound: 26, upperBound: 50, color: '#FFCD00', icon: icon3 },
          { lowerBound: 51, upperBound: 75, color: '#6EC8A0', icon: icon4 },
          { lowerBound: 76, upperBound: 100, color: '#1B8642', icon: icon5 },
        ],
        backgroundRanges: [
          { lowerBound: 0, upperBound: 33, color: '#E1E2E3' },
          { lowerBound: 33, upperBound: 66, color: '#D1D3D5' },
          { lowerBound: 66, upperBound: 100, color: '#A4A7AA' },
        ],
      };
const showNeedle = boolean('SHOW NEEDLE',false);
const title = text('TITLE', 'Average Battery');
export default {
    name: "robot-battery-map",
    data(){
        return{
            level: 34,
        }
    },
    computed: {
        configuration(){
            configuration.showNeedle = showNeedle;
            return Object.assign({}, configuration);
        },
        title(){
            return title;
        }
    }
}
</script>

<style scoped>

</style>
