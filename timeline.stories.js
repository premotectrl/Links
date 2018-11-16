/**
 * Created by jlong on 6/13/18
 */

import {storiesOf} from '@storybook/vue';
import {action} from '@storybook/addon-actions';
import {withNotes} from '@storybook/addon-notes';
import { withKnobs, select } from '@storybook/addon-knobs/vue';

import moment from 'moment';
import KukaTimeline from '../KukaTimeline.vue';
import markdown from '../docs/KukaTimeline.md';
import icon from '../assets/Clock_outline_orange.svg';

const randomize = (dataArray, range, start) => {
    const datas = [];

    for (let i = 0; i < 8; i += 1) {
        datas.push({
            x: new Date(Math.random() * range + start),
        });
    }

    dataArray.splice(0, dataArray.length, ...datas);
    console.log(datas);
};

const randomize2 = (dataArray, range, start) => {
   
    const colors =['#1B8642','#6EC8A0','#CF2027', '#fe6c2b'];
    for(let j = 0; j < 2; j++){
        const datas = [];
        for (let i = 0; i < 2; i += 1) {
        
            datas.push({
                x: new Date(Math.random() * range + start),
            });
            //dataArray.splice(i, dataArray.length, ...Dset);
           
            //dataArray.push(Dset);
        }
        var Dset = {
            id: j,
            label: 'Peter',
            pointColor: colors[j],
            y: 1,
            datas,
        }
        dataArray = Object.assign({}, Dset);
    }      
    console.log("Peter" , dataArray);
    //dataArray.splice(0, dataArray.length, ...datas);
};

storiesOf('KukaTimeline', module)
    .addDecorator(withKnobs)
    .add('one-axis', withNotes(markdown)(() => {
        const locales = {
            en: 'English',
            de: 'German',
            'zh-Hans': 'Chinese',
        };
        const localePicker = select(':locale', locales, 'en');

        const startDate = moment().subtract(12, 'y');
        const endDate = moment();

        const dataset = {
            id: '1',
            label: 'Dataset 1',
            pointColor: '#ff5800',
            y: 1,
            data: [],
        };

        return {
            components: { 'k-timeline': KukaTimeline },
            template: `
<div>
    <k-timeline :min-date="startDate"
                :max-date="endDate" 
                :data-sets="datasets"
                :locale="locale"
                @timeline-changed="handleTimelineChange">
        <div slot="tooltip" slot-scope="{ datapoints }">
            <div v-if="datapoints.length > 0">
                <div style="height: 16px; width: 16px; border-radius: 50%; display: inline-block"
                     :style="{'background-color': datapoints[0].pointColor}"></div>
                <span>{{ 'x: ' + new Date(datapoints[0].x).toISOString() }}</span>
            </div>
        </div>
    </k-timeline>
    <button input="button" @click="randomize">Randomize</button>
</div>
`,
            data () {
                return {
                    startDate: startDate.toDate(),
                    endDate: endDate.toDate(),
                    datasets: [dataset],
                };
            },
            computed: {
                locale () {
                    return localePicker;
                }
            },
            mounted () {
                this.randomize();
            },
            methods: {
                handleTimelineChange (dateRange) {
                    this.startDate = dateRange.start;
                    this.endDate = dateRange.end;
                    action('Timeline changed')(dateRange);
                },
                randomize () {
                    randomize(
                        this.datasets[0].data,
                        this.endDate.valueOf() - this.startDate.valueOf(),
                        this.startDate.valueOf()
                    );
                },
            },
        };
    }))
    .add('Continuous-timeline', withNotes(markdown)(() => {
        const locales = {
            en: 'English',
            de: 'German',
            'zh-Hans': 'Chinese',
        };
        const localePicker = select(':locale', locales, 'en');

        const startDate = moment().subtract(12, 'y');
        const endDate = moment();

        const dataset = {
            id: '6',
            label: 'delete',
            pointColor: '#ff5800',
            y: 1,
            data: [],
        };

        return {
            components: { 'k-timeline': KukaTimeline },
            template: `
<div>
    <k-timeline :min-date="startDate"
                :max-date="endDate" 
                :data-sets="datasets"
                :locale="locale"
                @timeline-changed="handleTimelineChange">
        <div slot="tooltip" slot-scope="{ datapoints }">
            <div v-if="datapoints.length > 0">
                <div style="height: 16px; width: 16px; border-radius: 50%; display: inline-block"
                     :style="{'background-color': datapoints[0].pointColor}"></div>
                <span>{{ 'x: ' + new Date(datapoints[0].x).toISOString() }}</span>
            </div>
        </div>
    </k-timeline>
    <button input="button" @click="randomize">Randomize</button>
</div>
`,
            data () {
                return {
                    startDate: startDate.toDate(),
                    endDate: endDate.toDate(),
                    datasets: [dataset],
                };
            },
            computed: {
                locale () {
                    return localePicker;
                }
            },
            mounted () {
                this.randomize();
            },
            methods: {
                handleTimelineChange (dateRange) {
                    this.startDate = dateRange.start;
                    this.endDate = dateRange.end;
                    action('Timeline changed')(dateRange);
                },
                randomize () {
                    randomize2(
                        this.datasets,
                        this.endDate.valueOf() - this.startDate.valueOf(),
                        this.startDate.valueOf()
                    );
                },
            },
        };
    }))

    .add('two-axis', withNotes(markdown)(() => {
        const locales = {
            en: 'English',
            de: 'German',
            'zh-Hans': 'Chinese',
        };
        const localePicker = select(':locale', locales, 'en');

        const startDate = moment().subtract(12, 'y');
        const endDate = moment();

        const dataset1 = {
            id: '1',
            label: 'Dataset 1',
            pointIcon: icon,
            y: 1,
            data: [],
        };

        const dataset2 = {
            id: '2',
            label: 'Dataset 2',
            pointColor: '#B8D0E8',
            y: -1,
            data: [],
        };

        return {
            components: { 'k-timeline': KukaTimeline },
            template: `
<div>
    <k-timeline :min-date="startDate"
                :max-date="endDate" 
                :data-sets="datasets"
                :locale="locale"
                include-lower-line
                @timeline-changed="handleTimelineChange">
        <div slot="tooltip" slot-scope="{ datapoints }">
            <div v-if="datapoints.length > 0">
                <img v-if="datapoints[0].pointIcon" style="width: 16px; height: 16px;" :src="datapoints[0].pointIcon">
                <div v-else style="height: 16px; width: 16px; border-radius: 50%; display: inline-block"
                     :style="{'background-color': datapoints[0].pointColor}"></div>
                <span>{{ datapoints[0].label + ': ' + new Date(datapoints[0].x).toISOString() }}</span>
            </div>
        </div>
    </k-timeline>
    <button input="button" @click="randomize">Randomize</button>
</div>
`,
            data () {
                return {
                    startDate: startDate.toDate(),
                    endDate: endDate.toDate(),
                    datasets: [dataset1, dataset2],
                };
            },
            computed: {
                locale () {
                    return localePicker;
                }
            },
            mounted () {
                this.randomize();
            },
            methods: {
                handleTimelineChange (dateRange) {
                    this.startDate = dateRange.start;
                    this.endDate = dateRange.end;
                    action('Timeline changed')(dateRange);
                },
                randomize () {
                    this.datasets.forEach(ds => {
                        randomize(
                            ds.data,
                            this.endDate.valueOf() - this.startDate.valueOf(),
                            this.startDate.valueOf()
                        );
                    });
                },
            },
        };
    }))
;