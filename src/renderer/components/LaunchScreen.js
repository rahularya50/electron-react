import React from "react";
// eslint-disable-next-line import/no-extraneous-dependencies
// import { remote } from "electron"; // todo: RE-ENABLE!!!
import {
    MENU_CLOSE_TAB,
    MENU_NEW,
    MENU_OPEN,
    MENU_SAVE, MENU_SAVE_AS,
    SHOW_OPEN_DIALOG,
} from "../../common/communicationEnums.js";
import IntroBox from "./IntroBox";
import { sendNoInteract } from "../utils/communication.js";
import claimMenu from "../utils/menuHandler.js";

export default class LaunchScreen extends React.Component {
    static closeTab() {
        remote.getCurrentWindow().close(); // TODO: RE-ENABLE!
    }

    constructor(props) {
        super(props);
        this.state = {
            detachMenuCallback:
                claimMenu({
                    [MENU_NEW]: this.handleCreateClick,
                    [MENU_OPEN]: this.handleOpenClick,
                    [MENU_SAVE]: () => null,
                    [MENU_SAVE_AS]: () => null,
                    [MENU_CLOSE_TAB]: LaunchScreen.closeTab,
                }),
        };
    }

    componentWillUnmount() {
        this.state.detachMenuCallback();
    }

    handleCreateClick = () => {
        const file = {
            name: "untitled",
            location: null,
            content: "",
        };
        this.props.onFileCreate(file);
    };

    handleOpenClick = async () => {
        const ret = await sendNoInteract({
            type: SHOW_OPEN_DIALOG,
        });
        if (ret.success) {
            this.props.onFileCreate(ret.file);
        }
    };

    render() {
        return (
            <div className="row">
                <div className="introColumn">
                    <IntroBox
                        onCreateClick={this.handleCreateClick}
                        onOpenClick={this.handleOpenClick}
                    />
                </div>
                <div className="recentColumn" />
            </div>
        );
    }
}
