import Taro from '@tarojs/taro'
import {
  View,
  PickerView,
  PickerViewColumn,
  MovableArea,
  MovableView
} from '@tarojs/components'
import { AtButton, AtModal, AtModalHeader, AtModalContent } from 'taro-ui'
import { CommonEvent } from '@tarojs/components/types/common'
import DocsHeader from '../components/doc-header'
import './index.scss'

interface IndexState {
  tabList: any[]
  // 移动的是哪个元素块
  moveId: number
  // 最终停止的位置
  endX: number
  endY: number
  questionList: any
  title: string
  detail: string
  answer: any[]
  isOpened: boolean
  modalContent: string
  id: string
}

export default class Index extends Taro.Component<{}, IndexState> {
  public config: Taro.PageConfig = {
    navigationBarTitleText: 'Parsons Puzzle'
  }

  public constructor() {
    super(...arguments)

    this.state = {
      tabList: [],
      id: '',
      questionList: {
        q1: {
          title: '奇偶判断',
          detail: '输入一个数字，判断该数字是奇数还是偶数',
          content: [
            {
              name: 'print("You picked an odd number.")'
            },
            {
              name: 'print("You picked an even number.")'
            },
            {
              name: 'mod = num % 2'
            },
            {
              name: 'else:'
            },
            {
              name: 'num = input("Enter a number: ")'
            },
            {
              name: 'if mod > 0:'
            }
          ],
          answer: {
            'num = input("Enter a number: ")': {
              name: 'num = input("Enter a number: ")',
              x: 0,
              next: ['mod = num % 2'],
              isHead:true
            },
            'mod = num % 2': {
              name: 'mod = num % 2',
              x: 0,
              next: ['if mod > 0:']
            },
            'if mod > 0:': {
              name: 'if mod > 0:',
              x: 0,
              next: ['print("You picked an odd number.")']
            },
            'print("You picked an odd number.")': {
              name: 'print("You picked an odd number.")',
              x: 20,
              next: ['else:']
            },
            'else:': {
              name: 'else:',
              x: 0,
              next: ['print("You picked an even number.")']
            },
            'print("You picked an even number.")': {
              name: ['print("You picked an even number.")'],
              x: 20
            }
          }
        },
        q2: {
          title: '寻找最高的人',
          detail:
            '有一个名为heights的字典：key是人名，value是身高（单位为米）。如：{"Alice":1.8,"Bob" 1.9,"Charlie" 1.75,"Dave" 1.4}。处理数据，并打印出身高最高的人的名字',
          content: [
            {
              name: 'for person in heights:'
            },
            {
              name: 'print( "the tallest person is", tallest )'
            },
            {
              name: 'max = 0'
            },
            {
              name: 'tallest = person'
            },
            {
              name: 'if height > max:'
            },
            {
              name: 'tallest = "No-one"'
            },
            {
              name: 'max = height'
            }
          ],
          answer: {
            'tallest = "No-one"': {
              name: 'tallest = "No-one"',
              x: 0,
              isHead: true,
              next: ['max = 0', 'for person in heights:']
            },
            'max = 0': {
              name: 'max = 0',
              x: 0,
              isHead: true,
              next: ['tallest = "No-one"', 'for person in heights:']
            },
            'for person in heights:': {
              name: 'for person in heights:',
              x: 0,
              next: ['if height > max:']
            },
            'if height > max:': {
              name: 'if height > max:',
              x: 20,
              next: ['max = height', 'tallest = person']
            },

            'max = height': {
              name: 'max = height',
              x: 40,
              next: [
                'print( "the tallest person is", tallest )',
                'tallest = person'
              ]
            },

            'tallest = person': {
              name: 'tallest = person',
              x: 40,
              next: [
                'print( "the tallest person is", tallest )',
                'max = height'
              ]
            },
            'print( "the tallest person is", tallest )': {
              name: 'print( "the tallest person is", tallest )',
              x: 0
            }
          },
          answer2: [
            {
              name: 'tallest = "No-one"',
              x: 0
            },
            {
              name: 'max = 0',
              x: 0
            },
            {
              name: 'for person in heights:',
              x: 0
            },
            {
              name: 'if height > max:',
              x: 20
            },

            {
              name: 'max = height',
              x: 40
            },

            {
              name: 'tallest = person',
              x: 40
            },
            {
              name: 'print( "the tallest person is", tallest )',
              x: 0
            }
          ]
        }
      },
      // 移动的是哪个元素块
      moveId: -1,
      title: '',
      detail: '',
      // 最终停止的位置
      endX: 0,
      endY: 0,
      answer: [],
      isOpened: false,
      modalContent: '回答错误'
    }
  }

  public componentDidMount(): void {
    const { id } = this.$router.params
    this.setState(
      {
        tabList: this.state.questionList[id].content,
        title: this.state.questionList[id].title,
        detail: this.state.questionList[id].detail,
        answer: this.state.questionList[id].answer,
        id: id[1]
      },
      () => {
        this.initMove()
      }
    )
  }

  private moveStart = (e: CommonEvent): void => {
    const moveid = e.currentTarget.dataset.moveid
    this.setState({
      moveId: moveid
    })
  }
  private moveStatus = (e: CommonEvent): void => {
    const val = e.detail.value
    // console.log(e)
    // 移动的块ID

    //如果在这里setstate moveid 移动过程中会有闪动
    //const moveid = e.currentTarget.dataset.moveid
    //console.log(moveid)
    // 最终坐标
    const x = e.detail.x
    const y = e.detail.y
    this.setState({
      endX: x,
      endY: y
    })
  }

  private initMove = (): void => {
    const tabList = this.state.tabList
    const tarr = []
    tabList.forEach(function(ele, index) {
      const obj = ele
      obj.id = index
      obj.x = tabList[index].x ? Math.ceil(tabList[index].x / 20) * 20 : 0
      obj.y = 50 * index + 20
      tarr.push(obj)
    })
    this.setState({
      tabList: tarr
    })
  }

  private compare = function(obj1, obj2) {
    const val1 = obj1.y
    const val2 = obj2.y
    if (val1 < val2) {
      return -1
    } else if (val1 >= val2) {
      return 1
    }
    return 0
  }
  private moveEnd = (e: CommonEvent): void => {
    const that = this
    // eslint-disable-next-line no-console

    const tablist = this.state.tabList
    tablist[that.state.moveId].x = that.state.endX
    tablist[that.state.moveId].y = that.state.endY
    that.setState(
      {
        tabList: tablist
      },
      () => {
        let tabList = this.state.tabList
        tabList = tabList.sort(that.compare)
        that.setState(
          {
            tabList
          },
          () => {
            setTimeout(function() {
              that.initMove()
            }, 200)
          }
        )
      }
    )
  }

  private handleSubmit = (): void => {
    const { tabList, answer } = this.state
    // for (let i = 0; i < tabList.length; i++) {
    //   if (tabList[i].name !== answer[i].name || tabList[i].x !== answer[i].x) {
    //     if (tabList[i].name !== answer[i].name) {
    //       this.setState({
    //         modalContent: `${tabList[i].name}排列错误`,
    //         isOpened: true
    //       })
    //     }
    //     if (tabList[i].x !== answer[i].x) {
    //       this.setState({
    //         modalContent: `${tabList[i].name}缩进错误`,
    //         isOpened: true
    //       })
    //     }
    //     return
    //   }
    // }

    let tabListIndex = 0
    let cur = answer[tabList[0].name]
    if (
      answer[tabList[0].name].isHead &&
      tabList[0].x === answer[tabList[0].name].x
    ) {
      cur = answer[tabList[0].name]
      tabListIndex++
      while (cur.next) {
        let flag = 0
        for (let i = 0; i < cur.next.length; i++) {
          if (cur.next[i] === tabList[tabListIndex].name) {
            if (answer[cur.next[i]].x !== tabList[tabListIndex].x) {
              this.setState({
                modalContent: `${cur.next[i]}缩进错误`,
                isOpened: true
              })
              return
            }
            cur = answer[tabList[tabListIndex].name]
            tabListIndex++
            flag = 1
            break
          }
        }

        if (!flag) {
          this.setState({
            modalContent: `${tabList[tabListIndex].name}排列错误`,
            isOpened: true
          })
          return
        }
      }
    } else {
      this.setState({
        modalContent: `${tabList[0].name}排列错误`,
        isOpened: true
      })
      return
    }
    if (tabListIndex === tabList.length) {
      this.setState({
        modalContent: `回答正确`,
        isOpened: true
      })
    } else {
      this.setState({
        modalContent: `${tabList[tabListIndex].name}排列错误`,
        isOpened: true
      })
    }
  }

  private handleClose = (): void => {
    this.setState({
      isOpened: false
    })
  }
  public render(): JSX.Element {
    const {
      tabList,
      moveId,
      title,
      detail,
      modalContent,
      isOpened,
      id
    } = this.state

    return (
      <View className='page'>
        {/* S Header */}
        <DocsHeader title={`问题${id.toUpperCase()}`}></DocsHeader>
        {/* E Header */}

        {/* S Body */}
        <View className='doc-body'>
          {/* 基础用法 */}
          <View className='panel'>
            <View className='panel__title'>{title}</View>
            <View className='panel__content'>
              <View className='example-item'>
                <View className='example-item__desc'>{detail}</View>
                {tabList.length ? (
                  <MovableArea
                    style={`width: 100%; height:${tabList.length *
                      60}px;display:flex;align-items:flex-start`}
                  >
                    {tabList.map((item, index) => (
                      <MovableView
                        style={`width:80%;height:40px;z-index:${
                          index === moveId ? 99 : 1
                        }`}
                        className='question-content'
                        direction='all'
                        outOfBounds
                        key={index + item.name}
                        onTouchStart={this.moveStart}
                        onChange={this.moveStatus}
                        data-moveid={index}
                        onTouchEnd={this.moveEnd}
                        x={item.x}
                        y={item.y}
                      >
                        {item.name}
                      </MovableView>
                    ))}
                  </MovableArea>
                ) : null}
                <View style='width:30%' onClick={this.handleSubmit}>
                  {' '}
                  <AtButton type='primary' size='small'>
                    提交
                  </AtButton>
                  <AtModal isOpened={isOpened} onClose={this.handleClose}>
                    <AtModalContent>{modalContent}</AtModalContent>
                  </AtModal>
                </View>
              </View>
            </View>
          </View>
        </View>
        {/* E Body */}
      </View>
    )
  }
}
