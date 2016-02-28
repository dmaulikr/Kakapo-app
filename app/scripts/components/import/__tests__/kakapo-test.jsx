/* eslint-env mocha */
/* eslint no-console:0 */
import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import { fromJS, List } from 'immutable';
import { getData } from '__tests__/helper';
import { newSoundClass } from 'classes/';
import Kakapo from '../kakapo';
import KakapoItem from '../kakapoItem';

function setup(props = {}) {
  const propData = {
    ...getData('search'),
    soundActions: {},
    ...getData('intl'),
    dispatch: (e) => e,
    ...props
  };
  const wrapper = shallow(<Kakapo {...propData} />);
  return {
    props,
    wrapper
  };
}

function randomSounds(count) {
  let arr = new List();
  for (let i = 0; i < count; i++) {
    const obj = { ...newSoundClass, source: 'file', progress: 1 };
    arr = arr.set(i, Object.keys(obj).reduce((newObj, _e) => {
      newObj[_e] = typeof obj[_e] === 'function' ? `test${i}` : obj[_e];
      return newObj;
    }, {}));
  }
  return arr;
}

describe('<Kakapo/>', () => {
  it('renders as a <div> with className equals `modal-inner`', () => {
    const { wrapper } = setup();
    expect(wrapper.type()).to.eql('div');
    expect(wrapper.prop('className')).to.eql('modal kakapo');
  });

  it('renders correct number of SoudCloud items', () => {
    const { wrapper } = setup({ search: fromJS({ kakapofavs: randomSounds(5) }) });
    expect(wrapper.find(KakapoItem).length).to.eql(5);
  });

  describe('When mounted', () => {
    it.skip('focus on input should change state', () => {
      const { wrapper } = setup();
      wrapper.find('.input__field').simulate('focus');
      expect(wrapper.state('focused')).to.eql('input-yt');
    });

    it.skip('should subscribe to RxJS autocomplete stream', () => {

    });
  });
});
