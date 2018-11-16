<template>
    <div class="timeline-container">
        <k-icon class="boundary-arrow left" :filepath="LeftArrow" @click.native="leftClickHandler()"/>
        <div class="chart-wrapper">
            <canvas :id="chartId"></canvas>
        </div>
        <k-icon class="boundary-arrow right" :filepath="RightArrow" @click.native="rightClickHandler()"/>
        <k-chart-tooltip :custom-tooltip-hook.sync="timelineTooltipHook">
            <div slot="tooltip" slot-scope="{ datapoints }">
                <slot name="tooltip" :datapoints="datapoints">No tooltip provided</slot>
            </div>
        </k-chart-tooltip> 
    </div>
</template>

<script>
    /* eslint-disable no-underscore-dangle */

    import _ from 'lodash';
    import moment from 'moment';
    import Chart from 'chart.js';
    import ZoomPlugin from 'chartjs-plugin-easy-zoom';
    import KukaChartTooltip from './KukaChartTooltip.vue';
    import KukaIcon from './KukaIcon.vue';
    import LeftArrow from '!svg-inline-loader?removeTags!./assets/Arrow_Timeline_Left_solid_darkgrey.svg';
    import RightArrow from '!svg-inline-loader?removeTags!./assets/Arrow_Timeline_Right_solid_darkgrey.svg';

    let timeline;
    let uid = 0;

    const updateGraph = chart =>
        (datasets) => {
            let iterableDatasets = datasets;
            if (!Array.isArray(datasets)) {
                iterableDatasets = [datasets];
            }

            iterableDatasets.forEach((d) => {
                if (d) {
                    _.remove(chart.data.datasets, { id: d.id });
                    chart.data.datasets.push(d);
                }
            });

            chart.update();
        };

    const updateBoundary = (chart, prop) =>
        (value) => {
            const axis = _.find(chart.options.scales.xAxes, { id: 'x-time' });

            if (axis && axis.ticks) {
                Object.assign(axis.ticks, { [prop]: value });
                chart.update();
            }
        };

    const updateLocale = chart =>
        (value) => {
            moment.locale(value);
            chart.update();
        };

    export default {
        name: 'KukaTimeline',
        components: { 'k-icon': KukaIcon, 'k-chart-tooltip': KukaChartTooltip },
        data () {
            uid += 1;
            return {
                chartId: `kuka-chartjs-${uid}`,
                LeftArrow,
                RightArrow,
                datapoints: [],
                timelineTooltipHook: null,
            };
        },
        props: { 
            locale: {
                type: String,
                validator: val => {
                    return val === 'de' || val === 'zh-Hans' || val === 'en';
                },
            },
            minDate: {
                required: true,
                type: Date,
            },
            maxDate: {
                required: true,
                type: Date,
            },
            includeLowerLine: Boolean,
            dataSets: {
                required: true,
                validator (value) {
                    if (Array.isArray(value)) {
                        for (let i = 0; i < value.length; i += 1) {
                            const ds = value[i];

                            if (!(ds.id && (_.isString(ds.id) || _.isNumber(ds.id)))) {
                                return false;
                            }

                            if (!(ds.label && _.isString(ds.label))) {
                                return false;
                            }

                            if (!(
                                (ds.pointIcon && _.isString(ds.pointIcon)) ||
                                (ds.pointColor && _.isString(ds.pointColor) && (ds.pointColor).match(/^#[0-9a-fA-F]{6}$/))
                            )) {
                                return false;
                            }

                            if (!(ds.y && _.isNumber(ds.y) && Math.abs(ds.y) === 1)) {
                                return false;
                            }

                            if (Array.isArray(ds.data)) {
                                for (let j = 0; j < ds.data.length; j += 1) {
                                    if (!(ds.data[j].x && moment(ds.data[j].x).isValid())) {
                                        return false;
                                    }
                                }

                                return true;
                            }

                            return false;
                        }

                        return true;
                    }

                    return false;
                },
            },
        },
        computed: {
            min () {
                return moment(this.minDate).valueOf();
            },
            max () {
                return moment(this.maxDate).valueOf();
            },
            chartDatasets () {
               
                return this.dataSets.map(ds => {
                     var  tempColor;
                    const pointImg = new Image(10, 10);
                    if (ds.pointIcon) {
                        pointImg.src = ds.pointIcon;
                    }
                    return {
                        id: ds.id,
                        type: 'line',
                        xAxisID: 'x-time',
                        label: ds.label,
                        showLine: true,
                        fill: false,
                        pointStyle: ds.pointIcon ? pointImg : 'circle',
                        pointRadius: 7,
                        backgroundColor: ds.pointColor,
                        borderColor: ds.pointColor,
                        //pointBackgroundColor: "#55bae7",
                        pointHoverRadius: 5,
                        pointHoverBorderWidth: 5,
                        pointHoverBorderColor: ds.pointColor ? this.convertHexToRGBA(ds.pointColor, 20) : undefined,
                        data: ds.data.map((d,index) => 
                            Object.assign(d,{   
                            x: moment(d.x),
                            y: ds.y,
                            label: ds.label,
                            pointIcon: ds.pointIcon,
                            pointColor: ds.pointColor, 
                        })),
                    };
                });
            },
            derivedLocale () {
                let derivedLocale = 'en';

                if (this.$currentLocaleCode) {
                    derivedLocale = this.$currentLocaleCode;
                }

                if (this.locale) {
                    derivedLocale = this.locale;
                }

                derivedLocale = derivedLocale.substr(0, 2);

                return derivedLocale === 'zh' ? 'zh_cn' : derivedLocale;
            },
        },
        mounted () {
            moment.locale(this.derivedLocale);

            const gridLineColors = [
                'transparent',
                'rgba(0, 0, 0, 0.1)',
                'transparent',
            ];

            if (this.includeLowerLine) {
                gridLineColors.push(...[
                    'rgba(0, 0, 0, 0.1)',
                    'transparent',
                ]);
            }

            const config = {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [],
                },
                plugins: [ZoomPlugin],
                options: {
                    defaultFontColor: '#676C71',
                    defaultFontFamily: 'kuka-bulo',
                    defaultFontSize: 12,
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: {
                        duration: 0,
                    },
                    legend: {
                        display: false,
                    },
                    tooltips: {
                        enabled: false,
                        mode: 'point',
                        custom: this.timelineTooltipHook,
                    },
                    hover: {
                        mode: 'point',
                    },
                    scales: {
                        yAxes: [
                            {
                                id: 'y-axis',
                                gridLines: {
                                    drawBorder: false,
                                    drawTicks: false,
                                    display: false, /**********Pet true to see lower horizontal line */
                                    zeroLineColor: 'transparent',
                                    color: gridLineColors,
                                },
                                ticks: {
                                    display: false,
                                    min: this.includeLowerLine ? -2 : 0,
                                    max: 2,
                                    stepSize: 1,
                                },
                            },
                        ],
                        xAxes: [
                            {
                                id: 'x-time',
                                type: 'linear',
                                ticks: {
                                    maxRotation: 0,
                                    callback (value, index, values) {
                                        if (_.first(values) >= _.last(values)) {
                                            return;
                                        }

                                        const fitBestTimeUnit = (lower, upper, ticks) => {
                                            if (Number.isNaN(lower) || Number.isNaN(upper)) {
                                                throw new Error('Invalid arguments:  Expect ms representation of time.');
                                            }

                                            if (lower > upper) {
                                                throw new Error('Invalid range:  Expect lower to be less than upper.');
                                            }

                                            const hour = 60 * 60 * 1000;
                                            const day = hour * 24;
                                            const month = day * 30;
                                            const year = day * 365;

                                            const range = upper - lower;
                                            if (range <= hour * ticks) {
                                                return 'MINUTE';
                                            } else if (range <= day * ticks && range > hour * ticks) {
                                                return 'HOUR';
                                            } else if (range <= month * ticks && range > day * ticks) {
                                                return 'DAY';
                                            } else if (range <= year * ticks && range > month * ticks) {
                                                return 'MONTH';
                                            }

                                            return 'YEAR';
                                        };

                                        const epocChanged = (prev, current, timeUnit) => {
                                            if (Number.isNaN(prev) || Number.isNaN(current)) {
                                                throw new Error('Invalid arguments:  Expect ms representation of time.');
                                            }

                                            if (prev > current) {
                                                throw new Error('Invalid range:  Expect prev to be less than current.');
                                            }

                                            const mPrev = moment(prev);
                                            const mCurrent = moment(current);

                                            if (timeUnit === 'MINUTE' || timeUnit === 'HOUR') {
                                                return mPrev.dayOfYear() !== mCurrent.dayOfYear();
                                            } else if (timeUnit === 'DAY') {
                                                return mPrev.month() !== mCurrent.month() ||
                                                    mPrev.year() !== mCurrent.year();
                                            }

                                            return mPrev.year() !== mCurrent.year();
                                        };

                                        const timeUnit = fitBestTimeUnit(_.first(values), _.last(values), values.length);

                                        if (index === 0 || index === values.length - 1) {
                                            if (timeUnit === 'MINUTE') {
                                                return [
                                                    moment(value).format('h:mm a').toLocaleUpperCase(),
                                                    moment(value).format('MMM D').toLocaleUpperCase(),
                                                ];
                                            } else if (timeUnit === 'HOUR') {
                                                return [
                                                    moment(value).format('h a').toLocaleUpperCase(),
                                                    moment(value).format('MMM D').toLocaleUpperCase(),
                                                ];
                                            } else if (timeUnit === 'DAY') {
                                                return [
                                                    moment(value).format('D').toLocaleUpperCase(),
                                                    moment(value).format('MMM').toLocaleUpperCase(),
                                                ];
                                            } else if (timeUnit === 'MONTH') {
                                                return [
                                                    moment(value).format('MMM').toLocaleUpperCase(),
                                                    moment(value).format('Y').toLocaleUpperCase(),
                                                ];
                                            }

                                            return moment(value).format('Y').toLocaleUpperCase();
                                        } else if (values.length > 2 && (index === 1 || index === values.length - 2)) {
                                            // Chart.js 2.6 time axis isn't as good as 2.7, so using linear instead.
                                            // The downside to this is I have to manually format the axis to display
                                            // as time without overlapping labels.
                                            // We cannot use Chart.js 2.7 because plugins are broken.
                                            return null;
                                        }

                                        // Because of the manual intervention to prevent clipping above, there is
                                        // a good chance index 1 does not exist.  If so, the "previous" index
                                        // should be 0.
                                        const prevIdx = values.length > 2 && index === 2 ? 0 : index - 1;

                                        if (timeUnit === 'MINUTE') {
                                            if (epocChanged(values[prevIdx], value, 'MINUTE')) {
                                                return [
                                                    moment(value).format('h:mm a').toLocaleUpperCase(),
                                                    moment(value).format('MMM D').toLocaleUpperCase(),
                                                ];
                                            }
                                            return moment(value).format('h:mm a').toLocaleUpperCase();
                                        } else if (timeUnit === 'HOUR') {
                                            if (epocChanged(values[prevIdx], value, 'HOUR')) {
                                                return [
                                                    moment(value).format('h a').toLocaleUpperCase(),
                                                    moment(value).format('MMM D').toLocaleUpperCase(),
                                                ];
                                            }
                                            return moment(value).format('h a').toLocaleUpperCase();
                                        } else if (timeUnit === 'DAY') {
                                            if (epocChanged(values[prevIdx], value, 'DAY')) {
                                                return [
                                                    moment(value).format('D').toLocaleUpperCase(),
                                                    moment(value).format('MMM').toLocaleUpperCase(),
                                                ];
                                            }
                                            return moment(value).format('D').toLocaleUpperCase();
                                        } else if (timeUnit === 'MONTH') {
                                            if (epocChanged(values[prevIdx], value, 'MONTH')) {
                                                return [
                                                    moment(value).format('MMM').toLocaleUpperCase(),
                                                    moment(value).format('Y').toLocaleUpperCase(),
                                                ];
                                            }
                                            return moment(value).format('MMM').toLocaleUpperCase();
                                        }

                                        return moment(value).format('Y').toLocaleUpperCase();
                                    },
                                    min: this.min,
                                    max: this.max,
                                },
                                gridLines: {
                                    drawBorder: false,
                                    display: false,
                                },
                            },
                        ],
                    },
                    zoom: {
                        enabled: true,
                        drag: true,
                        mode: 'x',
                        distanceMin: {
                            x: 5 * 60 * 1000,   // Cannot zoom tighter than a 5 minute window.
                        },
                        callback: this.rangeChanged,
                    },
                },
            };

            const timelineEl = document.getElementById(this.chartId);
            timeline = new Chart(timelineEl, Object.assign({}, config));
            this.$watch('chartDatasets', updateGraph(timeline), { immediate: true });
            this.$watch('min', updateBoundary(timeline, 'min'));
            this.$watch('max', updateBoundary(timeline, 'max'));
            this.$watch('derivedLocale', updateLocale(timeline));
        },
        methods: {
            rangeChanged (newMin, newMax) {
                this.$emit('timeline-changed', {
                    start: new Date(newMin),
                    end: new Date(newMax),
                });
            },
            convertHexToRGBA (color, opacity) {
                const hexCode = color.replace('#', '');
                const r = parseInt(hexCode.substring(0, 2), 16);
                const g = parseInt(hexCode.substring(2, 4), 16);
                const b = parseInt(hexCode.substring(4, 6), 16);
                return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
            },
            leftClickHandler () {
                const timeSpan = this.max - this.min;

                this.$emit('timeline-changed', {
                    start: new Date(this.min - timeSpan),
                    end: new Date(this.max - timeSpan),
                });
            },
            rightClickHandler () {
                const timeSpan = this.max - this.min;

                this.$emit('timeline-changed', {
                    start: new Date(this.min + timeSpan),
                    end: new Date(this.max + timeSpan),
                });
            },
        },
        beforeDestroy () {
            if (timeline) {
                timeline.destroy();
                timeline = null;
            }
        },
    };
</script>

<style scoped lang="scss">
    @import "styles/variables";

    .timeline-container {
        position: relative;

        .chart-wrapper {
            height: 100px;
            max-height: 100px;
        }

        .simple-svg-wrapper {
            fill: $kukaGray90;

            &:hover {
                fill: $kukaOrange;
            }
        }

        .boundary-arrow {
            position: absolute;
            top: 16px;

            &.right {
                right: 0;
                left: auto;
            }
        }
    }
</style>
