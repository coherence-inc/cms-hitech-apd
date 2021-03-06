import MockAdapter from 'axios-mock-adapter';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import sinon from 'sinon';

import * as actions from './apd';
import * as notificationActions from './notification';
import axios from '../util/api';

const mockStore = configureStore([thunk]);
const fetchMock = new MockAdapter(axios);

describe('apd actions', () => {
  it('requestApd should create GET_APD_REQUEST action', () => {
    expect(actions.requestApd()).toEqual({ type: actions.GET_APD_REQUEST });
  });

  it('receiveApd should create GET_APD_SUCCESS action', () => {
    const data = { name: 'foo' };
    expect(actions.receiveApd(data)).toEqual({
      type: actions.GET_APD_SUCCESS,
      data
    });
  });

  it('failApd should create GET_APD_FAILURE action', () => {
    expect(actions.failApd('foo')).toEqual({
      type: actions.GET_APD_FAILURE,
      error: 'foo'
    });
  });

  it('addApdKeyPerson should create ADD_APD_KEY_PERSON action', () => {
    expect(actions.addApdKeyPerson()).toEqual({
      type: actions.ADD_APD_KEY_PERSON
    });
  });

  it('removeApdKeyPerson should create REMOVE_APD_KEY_PERSON action', () => {
    expect(actions.removeApdKeyPerson('id')).toEqual({
      type: actions.REMOVE_APD_KEY_PERSON,
      id: 'id'
    });
  });

  it('requestSave should create SAVE_APD_REQUEST action', () => {
    expect(actions.requestSave()).toEqual({ type: actions.SAVE_APD_REQUEST });
  });

  it('saveSuccess should create SAVE_APD_SUCCESS action', () => {
    expect(actions.saveSuccess()).toEqual({ type: actions.SAVE_APD_SUCCESS });
  });

  it('saveFailure should create SAVE_APD_FAILURE action', () => {
    expect(actions.saveFailure()).toEqual({ type: actions.SAVE_APD_FAILURE });
  });

  it('selectApdOnLoad should create SET_SELECT_APD_ON_LOAD action', () => {
    expect(actions.selectApdOnLoad()).toEqual({
      type: actions.SET_SELECT_APD_ON_LOAD
    });
  });

  it('selectAPD should create SELECT_APD action, redirect to /apd, and saves APD ID to local storage', () => {
    const state = { apd: { byId: { apdID: 'hello there' } } };
    const store = mockStore(state);

    const global = { localStorage: { setItem: sinon.stub() } };
    const pushRoute = route => ({ type: 'FAKE_PUSH', pushRoute: route });

    const expectedActions = [
      { type: actions.SELECT_APD, apd: 'hello there' },
      { type: actions.UPDATE_BUDGET, state },
      { type: 'FAKE_PUSH', pushRoute: '/apd' }
    ];

    store.dispatch(actions.selectApd('apdID', { global, pushRoute }));

    expect(store.getActions()).toEqual(expectedActions);
    expect(global.localStorage.setItem.calledWith('last-apd-id', 'apdID'));
  });

  it('createRequest should create CREATE_APD_REQUEST action', () => {
    expect(actions.createRequest()).toEqual({
      type: actions.CREATE_APD_REQUEST
    });
  });

  it('createSuccess should create CREATE_APD_SUCCESS action', () => {
    expect(actions.createSuccess()).toEqual({
      type: actions.CREATE_APD_SUCCESS
    });
  });

  it('createFailure should create CREATE_APD_FAILURE action', () => {
    expect(actions.createFailure()).toEqual({
      type: actions.CREATE_APD_FAILURE
    });
  });

  describe('create APD', () => {
    // TODO: But for real.
    it('adds the new APD to the store and switches to it on success', () => {
      const newapd = { id: 'bloop' };
      fetchMock.onPost('/apds').reply(200, newapd);

      const pushRoute = route => ({ type: 'FAKE_PUSH', pushRoute: route });
      const state = {
        apd: {
          byId: {
            bloop: { hello: 'world' }
          }
        }
      };
      const store = mockStore(state);

      const expectedActions = [
        { type: actions.CREATE_APD_REQUEST },
        { type: actions.CREATE_APD_SUCCESS, data: newapd },
        { type: actions.SELECT_APD, apd: { hello: 'world' } },
        { type: actions.UPDATE_BUDGET, state },
        { type: 'FAKE_PUSH', pushRoute: '/apd' }
      ];

      return store.dispatch(actions.createApd({ pushRoute })).then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
    });

    it('does not do very much if it fails, either', () => {
      fetchMock.onPost('/apds').reply(403);
      const store = mockStore();

      const expectedActions = [
        { type: actions.CREATE_APD_REQUEST },
        { type: actions.CREATE_APD_FAILURE }
      ];

      return store.dispatch(actions.createApd()).then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
    });
  });

  it('updateBudget should create UPDATE_BUDGET action', () => {
    const state = { this: 'is', my: 'state ' };
    const store = mockStore(state);

    const expectedActions = [{ type: actions.UPDATE_BUDGET, state }];

    store.dispatch(actions.updateBudget());

    expect(store.getActions()).toEqual(expectedActions);
  });

  it('updateBudgetQuarterlyShare should create UPDATE_BUDGET_QUARTERLY_SHARE action', () => {
    expect(actions.updateBudgetQuarterlyShare('updates')).toEqual({
      type: actions.UPDATE_BUDGET_QUARTERLY_SHARE,
      updates: 'updates'
    });
  });

  describe('update APD', () => {
    it('creates UPDATE_APD action and does not update the budget if the APD years did not change', () => {
      const store = mockStore({});
      const updates = {};
      store.dispatch(actions.updateApd(updates));

      const expectedActions = [
        {
          type: actions.UPDATE_APD,
          updates
        }
      ];

      expect(store.getActions()).toEqual(expectedActions);
    });

    it('creates UPDATE_APD action and UPDATE_BUDGET if the APD years changed', () => {
      const store = mockStore({});
      const updates = { years: true };
      store.dispatch(actions.updateApd(updates));

      const expectedActions = [
        {
          type: actions.UPDATE_APD,
          updates
        },
        {
          type: actions.UPDATE_BUDGET,
          state: {}
        }
      ];

      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  describe('fetchApd (async)', () => {
    afterEach(() => {
      fetchMock.reset();
    });

    describe('creates GET_APD_SUCCESS after successful APD fetch', () => {
      it('does not select an APD by default', () => {
        const store = mockStore({ apd: { selectAPDOnLoad: false } });
        fetchMock.onGet('/apds').reply(200, [{ foo: 'bar' }]);

        const expectedActions = [
          { type: actions.GET_APD_REQUEST },
          { type: actions.GET_APD_SUCCESS, data: [{ foo: 'bar' }] }
        ];

        return store.dispatch(actions.fetchApd()).then(() => {
          expect(store.getActions()).toEqual(expectedActions);
        });
      });

      it('does not select an APD if there is no local storage', () => {
        const store = mockStore({ apd: { selectAPDOnLoad: true } });
        fetchMock.onGet('/apds').reply(200, [{ foo: 'bar' }]);

        const expectedActions = [
          { type: actions.GET_APD_REQUEST },
          { type: actions.GET_APD_SUCCESS, data: [{ foo: 'bar' }] }
        ];

        const global = {};

        return store.dispatch(actions.fetchApd({ global })).then(() => {
          expect(store.getActions()).toEqual(expectedActions);
        });
      });

      it('does not select an APD if local storage does not contain a last APD ID', () => {
        const store = mockStore({ apd: { selectAPDOnLoad: true } });
        fetchMock.onGet('/apds').reply(200, [{ foo: 'bar' }]);

        const expectedActions = [
          { type: actions.GET_APD_REQUEST },
          { type: actions.GET_APD_SUCCESS, data: [{ foo: 'bar' }] }
        ];

        const global = {
          localStorage: { getItem: sinon.stub().returns(null) }
        };

        return store.dispatch(actions.fetchApd({ global })).then(() => {
          expect(store.getActions()).toEqual(expectedActions);
        });
      });

      it('selects an APD if local storage contains a last APD ID', () => {
        const apd = {};
        const state = {
          apd: { byId: { 7: apd }, selectAPDOnLoad: true }
        };
        const store = mockStore(state);
        fetchMock.onGet('/apds').reply(200, [{ foo: 'bar' }]);

        const pushRoute = route => ({ type: 'FAKE_PUSH', pushRoute: route });

        const expectedActions = [
          { type: actions.GET_APD_REQUEST },
          { type: actions.GET_APD_SUCCESS, data: [{ foo: 'bar' }] },
          { type: actions.SELECT_APD, apd },
          { type: actions.UPDATE_BUDGET, state },
          { type: 'FAKE_PUSH', pushRoute: '/apd' }
        ];

        const global = {
          localStorage: {
            getItem: sinon.stub().returns(7),
            setItem: sinon.spy()
          }
        };

        return store
          .dispatch(actions.fetchApd({ global, pushRoute }))
          .then(() => {
            expect(store.getActions()).toEqual(expectedActions);
          });
      });
    });

    it('creates GET_APD_FAILURE after unsuccessful APD fetch', () => {
      const store = mockStore({});
      fetchMock.onGet('/apds').reply(403, 'foo');

      const expectedActions = [
        { type: actions.GET_APD_REQUEST },
        { type: actions.GET_APD_FAILURE, error: 'foo' }
      ];

      return store.dispatch(actions.fetchApd()).then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
    });
  });

  describe('fetch APD data if needed (async)', async () => {
    it('fetches data if it is not already loaded', async () => {
      const store = mockStore({
        apd: {
          loaded: false
        }
      });

      const expectedActions = [{ type: actions.GET_APD_REQUEST }];

      await store.dispatch(actions.fetchApdDataIfNeeded());
      expect(store.getActions()).toEqual(
        expect.arrayContaining(expectedActions)
      );
    });

    it('does not fetch data if it is already loaded', async () => {
      const store = mockStore({
        apd: {
          loaded: true
        }
      });

      await store.dispatch(actions.fetchApdDataIfNeeded());
      expect(store.getActions()).toEqual([]);
    });
  });

  describe('save APD to API', () => {
    const state = {
      notification: { open: false, queue: [] },
      apd: {
        data: {
          id: 'id-to-update',
          incentivePayments: {
            ehAmt: {
              1337: {
                1: 1,
                2: 2,
                3: 3,
                4: 4
              }
            },
            ehCt: {
              1337: {
                1: 10,
                2: 20,
                3: 30,
                4: 40
              }
            },
            epAmt: {
              1337: {
                1: 100,
                2: 200,
                3: 300,
                4: 400
              }
            },
            epCt: {
              1337: {
                1: 1000,
                2: 2000,
                3: 3000,
                4: 4000
              }
            }
          },
          hieNarrative: 'HIE narrative text',
          hitNarrative: 'HIT narrative text',
          mmisNarrative: 'MMIS narrative text',
          pointsOfContact: 'people to call if stuff goes sour',
          previousActivityExpenses: {
            1066: {
              hie: 'battle of hastings',
              hit: 'moop moop'
            }
          },
          previousActivitySummary: 'other activities happened in the past',
          overview: 'APD overview text',
          years: ['1992', '1993'],
          stateProfile: {
            medicaidDirector: 'an object goes here',
            medicaidOffice: 'an object goes here'
          }
        }
      },
      activities: {
        byKey: {
          '1': {
            name: 'activity name',
            fundingSource: 'funding source',
            descShort: 'activity summary',
            descLong: 'activity description',
            altApproach: 'alternatives approach',
            costAllocationDesc: 'cost allocation methodology',
            previousActivitySummary: 'other activities happened in the past',
            previousActivityExpenses: [
              {
                year: 1066,
                hie: 'battle of hastings',
                hit: 'moop moop'
              }
            ],
            otherFundingDesc: 'other funding sources',
            costAllocation: {
              '1993': { ffp: { federal: 90, state: 10 }, other: 0 },
              '1994': { ffp: { federal: 70, state: 20 }, other: 10 }
            },
            goals: [
              { desc: 'goal 1 description', obj: 'objective 1' },
              { desc: 'goal 2 description', obj: 'objective 2' }
            ],
            milestones: [
              { name: 'milestone 1', start: 'start 1', end: 'end 1' },
              { name: 'milestone 2', start: 'start 2', end: 'end 2' }
            ],
            statePersonnel: [
              {
                title: 'title 1',
                desc: 'description 1',
                years: {
                  '1993': { amt: 100, perc: 100 },
                  '1994': { amt: 200, perc: 40 }
                }
              }
            ],
            contractorResources: [
              {
                name: 'name 1',
                desc: 'description 1',
                years: { '1993': 100, '1994': 200 },
                hourly: {
                  useHourly: false,
                  data: {}
                }
              }
            ],
            expenses: [
              {
                category: 'category 1',
                desc: 'description 1',
                years: { '1993': 100, '1994': 200 }
              },
              {
                category: 'category 2',
                desc: 'description 2',
                years: { '1993': 300, '1994': 400 }
              }
            ],
            standardsAndConditions: {
              bizResults: 'business results',
              documentation: 'documentation',
              industry: 'industry standards',
              interoperability: 'interoperability',
              keyPersonnel: 'key personnel',
              leverage: 'leverage',
              minimizeCost: 'minimize cost',
              mitigation: 'mitigation',
              modularity: 'modularity',
              mita: 'mita',
              reporting: 'reporting'
            },
            quarterlyFFP: {
              '1993': {
                '1': {
                  combined: 20,
                  contractors: 30,
                  state: 40
                },
                '2': {
                  combined: 20,
                  contractors: 30,
                  state: 40
                },
                '3': {
                  combined: 20,
                  contractors: 30,
                  state: 40
                },
                '4': {
                  combined: 20,
                  contractors: 30,
                  state: 40
                }
              },
              '1994': {
                '1': {
                  combined: 20,
                  contractors: 30,
                  state: 40
                },
                '2': {
                  combined: 20,
                  contractors: 30,
                  state: 40
                },
                '3': {
                  combined: 20,
                  contractors: 30,
                  state: 40
                },
                '4': {
                  combined: 20,
                  contractors: 30,
                  state: 40
                }
              }
            }
          }
        }
      }
    };

    beforeEach(() => {
      fetchMock.reset();
    });

    it('creates save request and save failure actions if the save fails', () => {
      const store = mockStore(state);
      fetchMock.onPut('/apds/id-to-update').reply(403, [{ foo: 'bar' }]);

      const expectedActions = [
        { type: actions.SAVE_APD_REQUEST },
        {
          type: notificationActions.ADD_NOTIFICATION,
          message: 'Save failed (not-sure-why)'
        },
        { type: actions.SAVE_APD_FAILURE }
      ];

      return store.dispatch(actions.saveApd()).catch(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
    });

    it('creates save request and save success actions if the save succeeds', () => {
      const store = mockStore(state);
      fetchMock.onPut('/apds/id-to-update').reply(200, { foo: 'bar' });

      // TODO: Need to test what's actually sent to the API to make sure transformations are right

      const expectedActions = [
        { type: actions.SAVE_APD_REQUEST },
        {
          type: notificationActions.ADD_NOTIFICATION,
          message: 'Save successful!'
        },
        { type: actions.SAVE_APD_SUCCESS, data: { foo: 'bar' } }
      ];

      return store.dispatch(actions.saveApd()).then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
    });
  });

  describe('submit an APD', () => {
    const budget = {
      activities: {
        'activity-key': {
          quarterlyFFP: 'quarterly ffp'
        }
      },
      combined: 'overall combined',
      federalShareByFFYQuarter: 'federal share, ffy quarter',
      hie: {
        hello: 'from hie',
        combined: 'hie combined'
      },
      hit: {
        also: 'from hit',
        combined: 'hit combined'
      },
      hitAndHie: {
        combined: 'hit and hie combined'
      },
      mmis: {
        greetings: 'from mmis',
        combined: 'mmis combined'
      },
      mmisByFFP: 'mmis by ffp'
    };

    beforeEach(() => {
      fetchMock.reset();
    });

    it('sets a notification if the preceding save fails', () => {
      const store = mockStore({
        activities: {
          byKey: { 'activity-key': { name: 'number one best activity' } }
        },
        apd: { data: { id: 'id-to-update' } },
        budget,
        notification: { open: false, queue: [] }
      });

      const save = () => () =>
        Promise.reject(new Error('preceding save failed (set by test)'));
      const spy = jest.spyOn(axios, 'post');

      const expectedActions = [
        {
          type: notificationActions.ADD_NOTIFICATION,
          message: 'Submit failed (not-sure-why)'
        }
      ];

      return store.dispatch(actions.submitAPD(save)).then(() => {
        expect(store.getActions()).toEqual(expectedActions);
        expect(spy).not.toHaveBeenCalled();
      });
    });

    it('sets a notification if the submission fails', () => {
      const store = mockStore({
        activities: {
          byKey: { 'activity-key': { name: 'number one best activity' } }
        },
        apd: { data: { id: 'id-to-update' } },
        budget,
        notification: { open: false, queue: [] }
      });
      const save = () => () => Promise.resolve();
      const spy = jest.spyOn(axios, 'post');

      fetchMock.onPost('/apds/id-to-update/versions').reply(403);

      const expectedActions = [
        { type: actions.SUBMIT_APD_REQUEST },
        {
          type: notificationActions.ADD_NOTIFICATION,
          message: 'Submit failed (not-sure-why)'
        },
        { type: actions.SUBMIT_APD_FAILURE }
      ];

      return store.dispatch(actions.submitAPD(save)).then(() => {
        expect(store.getActions()).toEqual(expectedActions);
        expect(spy).toHaveBeenCalled();
      });
    });

    it('sets a notification if the submission succeeds', () => {
      const store = mockStore({
        activities: {
          byKey: { 'activity-key': { name: 'number one best activity' } }
        },
        apd: { data: { id: 'id-to-update' } },
        budget,
        notification: { open: false, queue: [] }
      });
      const save = () => () => Promise.resolve();
      const spy = jest.spyOn(axios, 'post');

      fetchMock.onPost('/apds/id-to-update/versions').reply(204);

      const expectedActions = [
        { type: actions.SUBMIT_APD_REQUEST },
        {
          type: notificationActions.ADD_NOTIFICATION,
          message: 'Submission successful!'
        },
        { type: actions.SUBMIT_APD_SUCCESS }
      ];

      beforeEach(() => {
        fetchMock.reset();
      });

      return store.dispatch(actions.submitAPD(save)).then(() => {
        expect(store.getActions()).toEqual(expectedActions);
        expect(spy).toHaveBeenCalled();
        expect(spy.mock.calls[0][1]).toMatchObject({
          tables: {
            activityQuarterlyFederalShare: {
              'number one best activity': 'quarterly ffp'
            },
            summaryBudgetTable: {
              hie: { hello: 'from hie', combined: 'hie combined' },
              hit: { also: 'from hit', combined: 'hit combined' },
              mmis: { greetings: 'from mmis', combined: 'mmis combined' },
              total: 'overall combined'
            },
            federalShareByFFYQuarter: 'federal share, ffy quarter',
            programBudgetTable: {
              hitAndHie: {
                hie: 'hie combined',
                hit: 'hit combined',
                hitAndHie: 'hit and hie combined'
              },
              mmis: 'mmis by ffp'
            }
          }
        });
      });
    });
  });
});
