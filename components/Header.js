
import React, { useState, useRef, useMemo, Fragment } from 'react'
import Logo from "./Logo";
import Nav from "./nav";
import { useScrollPosition } from "../services/helpers/scroll"
import { Affix } from 'antd'
import classNames from 'classnames'
import mainMenus from '../constants/mainMenus'
import rightMenus from "../constants/rightMenus";
import NavMobile from './navMobile';
import mobileMenus from '../constants/mobileMenus';




const Header = ({bg, theme, versions, fixed}) => {
    const versionClass = versions.map(el => (`c-header--${el}`)).join(" ")
    const [isFixed, setIsFixed] = useState(false)
    const [show, setIsShow] = useState(true)
    const [isAtTop, setIsAtTop] = useState(true)
   const [hideOnScroll, setHideOnScroll] = useState(true)

  useScrollPosition(
    ({ prevPos, currPos }) => {
        let showNav = currPos.y > prevPos.y;
        console.log(document.body.getBoundingClientRect().top)
        setIsShow(showNav)
        if(currPos.y === -124){
            setIsAtTop(false)
        } else {
            setIsAtTop(true)
        }
         
        // console.log({show})
        
      const isShow = currPos.y > prevPos.y
      if (isShow !== hideOnScroll) setHideOnScroll(isShow)
    },
    [hideOnScroll],
    false,
    false,
    300
  )

 
    if(fixed){
    return (
        <div>
        
            <div className={classNames("c-header__wrapper", {
                "c-header__wrapper--hidden": !show && !fixed,
            })}>
                <header onScroll={(e) => {
                }}  className={classNames(" c-header", {
                    "c-header--light": true,
                    "c-header--fixed": true && !fixed,
                    "c-header--pinned": isFixed || bg,
                    ["c-header--"+theme]: theme,
                    [versionClass]: versions
                })}> 
                        <NavMobile parent="c-header" items={mobileMenus} />
                        <Nav parent="c-header" items={mainMenus} />
                        <Logo />
                        <Nav parent="c-header" isRight={true} items={rightMenus} />
                </header>
            </div>
      
        </div>
    )} else {
        return (
            <div>
             <Affix className="c-header__affix"  >
                <div className={classNames("c-header__wrapper", {
                    "c-header__wrapper--hidden": !show && !fixed,
                })}>
                    <header onScroll={(e) => {
                    }}  className={classNames(" c-header", {
                        "c-header--light": true,
                        "c-header--fixed": true && !fixed,
                        "c-header--pinned": isFixed || bg,
                        ["c-header--"+theme]: theme,
                        [versionClass]: versions
                    })}> 
                            <NavMobile parent="c-header" items={mobileMenus} />
                            <Nav parent="c-header" items={mainMenus} />
                            <Logo />
                            <Nav parent="c-header" isRight={true} items={rightMenus} />
                    </header>
                </div>
            </Affix>
            </div>
        )
    }
}

Header.defaultProps = {
    bg: false,
    versions: []
}


const headMeta = {}


export default Header