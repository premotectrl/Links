import axios from 'axios';

import { KPIS, SAFETY_STATES, ENDPOINTS } from "./constants.js";

const endTime = new Date();
const endTimeMins = endTime.getMinutes();
const newEndTimeMins = endTimeMins + (10 - endTimeMins % 10);   // Round minutes up to nearest 10 minutes
endTime.setMinutes(newEndTimeMins, 0, 0);

const startTime = new Date();
startTime.setMinutes(newEndTimeMins, 0, 0);
startTime.setDate(endTime.getDate() - 7);   // Default time window is 1 week

const time_zone_offset_minutes = endTime.getTimezoneOffset();

/**
 * Takes a list of keys to use in an Object and creates an Object that maps
 * a default value to each entry
 *
 * @param keys      keys to use for the Object
 * @param filler    default value to use for each Object entry
 */
function filledObjectFromKeys (keys, filler) {
    return keys.reduce(function(acc, key) {
        const toAdd = {};
        toAdd[key] = filler;
        return Object.assign({}, acc, toAdd); // Do it this way to avoid side effects #functionalprogramming
    }, {});
}

const MobileRoboticsStore = {
    namespaced: true,

    // Variables to persist the state of the store
    state: {
        fleetView: true,
        startTime,
        endTime,
        posereliabilityData : {
            "RELIABLE" : null,
            "UNDECIDED" : null,
            "UNRELIABLE" : null
        },
        connectionData : {
            "CONNECTED" : null,
            "UNRELIABLE" : null,
            "DISCONNECTED" : null,
            "DISPOSED" : null
        },
        commandabilityData: {
            "COMMANDABLE": null,
            "TEMPORARILY_NOT_COMMANDABLE": null,
            "NOT_COMMANDABLE": null
        },
        battery,
        safetyStateUpdateComplete: filledObjectFromKeys(SAFETY_STATES, false),
        safetyStateData: filledObjectFromKeys(['Timestamps'].concat(SAFETY_STATES), []),
    },

    // Methods to update the state variables
    mutations: {
        SET_FLEET_VIEW (state, payload) {
            state.fleetView = payload.fleetView;
        },
        SET_TIME_RANGE (state, payload) {
            state.startTime = payload.startTime;
            state.endTime = payload.endTime;
        },
        SET_SCALAR_KPIS (state, payload) {
            const group = payload.group_id;
            const kpi = payload.kpi_id;
            state[group][kpi] = payload.value;
        },
        SET_BATTERY(state, payload) {
            const kpi = payload.kpi_id;
            state[kpi] = payload.value;
        },
        UPDATE_SAFETY_STATE_DATA (state, payload) {
            state.safetyStateData[payload.safetyState] = payload.data;

            if (state.safetyStateData.Timestamps.length === 0) {
                state.safetyStateData.Timestamps = payload.timestamps;
            }

            state.safetyStateUpdateComplete[payload.safetyState] = true;
        },
        BEGIN_SAFETY_STATE_UPDATE (state, payload) {
            state.safetyStateUpdateComplete[payload.safetyState] = false;
        },
        RESET_TIMESTAMPS (state, payload) {
            state.safetyStateData.Timestamps = [];
        },
    },

    // Events triggered from outside the store
    actions: {
        SET_FLEET_VIEW({commit}, payload) {
            commit('SET_FLEET_VIEW', payload);
        },
        SET_TIME_RANGE({commit}, payload) {
            commit('SET_TIME_RANGE', payload);
        },
        UPDATE_BATTERY({commit, state}, payload){
            console.log(serial_num);
            const serial_num = payload.serialNumber;
            const request = {
                method: 'POST',
                url: ENDPOINTS.getScalarKpi,
                withCredentials: true,
                data: {
                    device_id: [serial_num],
                    kpi_id: 'mr-battery',
                    start_time: state.startTime.toISOString(),
                    end_time: state.endTime.toISOString()
                },
            };
            axios(request)
                    .then(function (response) {
                        if (response.data.hasOwnProperty('kpi')) {
                            const responseArray = response.data.kpi;

                            const processedDataArray = responseArray.map(function (element) {
                                return {
                                    value: (element.value) ? element.value : 0.0,
                                    kpi_id: element.name.match(/[A-Z_]+/)[0],
                                    group_id: element.name.match(/-[a-z\-]*/)[0].split('-').join('') + 'Data',
                                };
                            });
                            commit('SET_BATTERY', processedDataArray[0]);
                        }
                    });
        }, 
        
        UPDATE_SCALAR_KPIS({commit, state}, payload) {
            const serial_num = payload.serialNumber;
           
            KPIS.forEach(function (kpi) {

                const request = {
                    method: 'POST',
                    url: ENDPOINTS.getScalarKpi,
                    withCredentials: true,
                    data: {
                        device_id: [serial_num],
                        kpi_id: [kpi],
                        start_time: state.startTime.toISOString(),
                        end_time: state.endTime.toISOString()
                    },
                };

                axios(request)
                    .then(function (response) {
                        if (response.data.hasOwnProperty('kpi')) {
                            const responseArray = response.data.kpi;

                            const processedDataArray = responseArray.map(function (element) {
                                return {
                                    value: (element.value) ? element.value : 0.0,
                                    kpi_id: element.name.match(/[A-Z_]+/)[0],
                                    group_id: element.name.match(/-[a-z\-]*/)[0].split('-').join('') + 'Data',
                                };
                            });
                            commit('SET_SCALAR_KPIS', processedDataArray[0]);
                        }
                        else {
                        // commiting emptyObject to the store if response.data has no property 'kpi'
                            const emptyObject = {
                                value: null,
                                kpi_id: request.data.kpi_id[0].match(/[A-Z_]+/)[0],
                                group_id: request.data.kpi_id[0].match(/-[a-z\-]*/)[0].split('-').join('') + 'Data',
                            };
                            commit('SET_SCALAR_KPIS', emptyObject);
                        }
                    })
                    .catch(function (error) {
                        console.log(error);
                    });
            });
        },

        UPDATE_SAFETY_STATE_DATA ({commit, state}, payload) {
            commit('BEGIN_SAFETY_STATE_UPDATE', { safetyState: payload.safetyState });

            const kpiStr = `mr-safety-state-${payload.safetyState}`;

            const request = {
                method: 'GET',
                url: ENDPOINTS.getHistoricalKpi.replace('{kpi}', kpiStr)
                    .replace('{asset_id}', '70ce167b-2258-34d1-9498-7f5b59d70a47'),
                withCredentials: true,
                params: {
                    window: 'TEN_MINUTE',
                    time_zone_offset_minutes,
                    start_time: payload.start_time,
                    end_time: payload.end_time,
                },
            };

            axios(request)
                .then(function (response) {
                    const timestamps = response.data.kpi[0].data.map(function (it) {
                        return new Date(it.start_time);
                    });
                    const data = response.data.kpi[0].data.map(function (it) {
                        return (it.mean && it.mean.value) ? it.mean.value : 0.0
                    });

                    commit('UPDATE_SAFETY_STATE_DATA',
                        {
                            safetyState: payload.safetyState,
                            timestamps,
                            data,
                        });
                })
                .catch(function (error) {
                    console.log(error);
                });
        },
        UPDATE_ALL_SAFETY_STATES ({dispatch, commit, state}, payload) {
            commit('RESET_TIMESTAMPS', {});

            const start_time = state.startTime.toISOString();
            const end_time = state.endTime.toISOString();

            SAFETY_STATES.forEach(function (ss) {
                dispatch('UPDATE_SAFETY_STATE_DATA',
                    {
                        safetyState: ss,
                        start_time,
                        end_time,
                    });
            });
        },
    },

    // Methods to retrieve data from the store
    getters: {
        GET_FLEET_VIEW (state) {
            return state.fleetView;
        },
        GET_TIME_RANGE (state) {
            return {
                startTime: state.startTime,
                endTime: state.endTime
            };
        },
        GET_COMMANDABILITY (state) {
            return state.commandabilityData;
        },
        GET_CONNECTION (state) {
            return state.connectionData;
        },
        GET_POSE_RELIABILITY (state) {
            return state.posereliabilityData;
        },
        GET_SAFETY_STATE_UPDATE_COMPLETE (state) {
            return Object.values(state.safetyStateUpdateComplete).every(function (ss) {
                return ss;
            });
        },
        GET_SAFETY_STATE_DATA (state) {
            return state.safetyStateData;
        }
    },
};

export default MobileRoboticsStore;