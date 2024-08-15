import React, {useCallback, useEffect, useState} from "react";
import {
    Card,
    TextContainer,
    TextField,
    ChoiceList,
    Modal,
    FooterHelp,
    Link,
    Button,
    Select,
    DescriptionList,
    Banner
} from "@shopify/polaris";
import {SettingsMajor} from "@shopify/polaris-icons";
import {Toast} from "@shopify/app-bridge-react";
import {useAppQuery, useAuthenticatedFetch} from "../hooks";

export function TimeouterCard() {
    const emptyToastProps = {content: null};
    const [isLoading, setIsLoading] = useState(true);
    const [toastProps, setToastProps] = useState(emptyToastProps);
    const [timeouterTitle, setTimeouterTitle] = useState("");
    const [timeouterDescription, setTimeouterDescription] = useState("");
    const [timeouterDiscountCode, setTimeouterDiscountCode] = useState("");
    const [selectedTimeouterDuration, setSelectedTimeouterDuration] = useState("");
    const [selectedTimeouterDisplay, setSelectedTimeouterDisplay] = useState("");
    const [selectedTimeouterTheme, setSelectedTimeouterTheme] = useState("");
    const [selectedTimeouterStatus, setSelectedTimeouterStatus] = useState("");
    const [selectedDisplayScope, setSelectedDisplayScope] = useState(false);

    const fetch = useAuthenticatedFetch();
    const [activeAbout, setActiveAbout] = useState(false);
    const [activeSettings, setActiveSettings] = useState(false);

    const handleModalChange = useCallback(() => setActiveAbout(!activeAbout), [activeAbout]);
    const handleSettingsChange = useCallback(() => setActiveSettings(!activeSettings), [activeSettings]);

    const handleTimeouterDisplay = useCallback((value) => setSelectedTimeouterDisplay(value), []);
    const handleTimeouterTime = useCallback((value) => setSelectedTimeouterDuration(value), []);
    const handleTimeouterTitleChange = useCallback((value) => setTimeouterTitle(value), []);
    const handleTimeouterDiscountCode = useCallback((value) => setTimeouterDiscountCode(value), []);
    const handleTimeouterDesctiptionChange = useCallback((value) => setTimeouterDescription(value), []);
    const handleOptionChangeTimeouterStatus = useCallback((value) => setSelectedTimeouterStatus(value), []);
    const handleOptionChangeTimeouterTheme = useCallback((value) => setSelectedTimeouterTheme(value), []);

    const displayOptions = [
        {label: "Online Store", value: "online_store"},
        {label: "Order Page", value: "order_status"},
        {label: "Anywhere", value: "all"}
    ];

    const timeOptions = [
        {label: "1 day", value: "1"},
        {label: "3 days", value: "3"},
        {label: "1 week", value: "7"},
        {label: "1 month", value: "30"}
    ];

    const {data, isLoading: isLoadingCount} = useAppQuery({
        url: "/api/timeouter/data",
        reactQueryOptions: {
            onSuccess: () => {
                setIsLoading(false);
            }
        }
    });

    useEffect(() => {
        dataRep();
    }, [data]);

    function dataRep() {
        setTimeouterTitle((data?.title ?? ""));
        setTimeouterDescription((data?.description ?? ""));
        setTimeouterDiscountCode((data?.discount_code ?? ""));
        setSelectedTimeouterDuration((data?.duration ?? "1"));
        if (data?.display_scope) {
            setSelectedDisplayScope(true);
            setSelectedTimeouterDisplay((data?.display_scope === "online_store") ? "online_store" : (data?.display_scope === "order_status" ? "order_status" : "all"));
        } else {
            setSelectedTimeouterDisplay((data?.display_scope === "online_store") ? "online_store" : (data?.display_scope === "order_status" ? "order_status" : "all"));
        }
        setSelectedTimeouterTheme((data?.theme === 1 ? "1" : "0") ?? "0");
        setSelectedTimeouterStatus((data?.status === 1 ? "1" : "0") ?? "0");
    }

    function resetFields() {
        setTimeouterTitle("");
        setTimeouterDescription("");
        setTimeouterDiscountCode("");
        setSelectedTimeouterDuration("1");
        setSelectedDisplayScope(false);
        setSelectedTimeouterDisplay("all");
        setSelectedTimeouterTheme("0");
        setSelectedTimeouterStatus("0");
    }

    const toastMarkup = toastProps.content && (
        <Toast {...toastProps} onDismiss={() => setToastProps(emptyToastProps)}/>
    );

    const windowFooterStyle = {
        footerContainer: {
            display: "flex",
            justifyContent: "space-between",
            width: "auto",
            paddingTop: "50px"
        },
        footerSettingsBlock: {
            display: "flex",
            justifyContent: "flex-end",
            flexDirection: "row",
            alignContent: "center",
            alignItems: "flex-start"
        },
        footerSaveButton: {
            marginLeft: "10px"
        }
    };

    const deleteTimeouter = async () => {
        setIsLoading(true);
        const response = await fetch("/api/timeouter/delete", {
            method: "GET",
        });
        if (response.ok) {
            resetFields();
            setToastProps({content: "Timeouter has been successfully deleted"});
            setIsLoading(false);
            setActiveSettings(false);
        } else {
            setIsLoading(false);
            setToastProps({
                content: "Timeouter script not found",
                error: true
            });
        }
    };

    const handlePopulateTimeouter = async () => {
        setIsLoading(true);
        const response = await fetch("/api/timeouter/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
            body: JSON.stringify({
                title: timeouterTitle,
                description: timeouterDescription,
                discount: timeouterDiscountCode,
                duration: selectedTimeouterDuration,
                display: selectedTimeouterDisplay,
                theme: selectedTimeouterTheme,
                status: selectedTimeouterStatus
            })
        });

        if (response.ok) {
            if (selectedTimeouterStatus == "1") {
                setToastProps({content: "Timeouter enabled"});
            } else {
                setToastProps({content: "Timeouter disabled"});
            }
            setSelectedDisplayScope(true)
            setIsLoading(false);
        } else {
            setIsLoading(false);
            setToastProps({
                content: "There was an error adding timeouter",
                error: true
            });
        }
    };

    return (
        <>
            {toastMarkup}
            <Card title="Timeouter" sectioned>
                <p>
                    This application allows you to connect timeout modal window to your shopify store.
                    You can read the instructions for use to familiarize yourself with the application
                </p>
            </Card>
            <Card
                sectioned
            >
                <TextContainer spacing="loose">
                    <TextField
                        value={timeouterTitle}
                        onChange={handleTimeouterTitleChange}
                        autoComplete="script"
                        label="Enter you title text"
                        type="timeouterTitle"
                        placeholder={"Title"}
                        helpText={
                            <span>
              This text is the title of your modal window
            </span>
                        }
                    />
                    <TextField
                        value={timeouterDescription}
                        onChange={handleTimeouterDesctiptionChange}
                        autoComplete="script"
                        label="Enter you description text"
                        type="timeouterDescription"
                        placeholder={"Description"}
                        helpText={
                            <span>
              This text is the description of your modal window
            </span>
                        }
                    />
                </TextContainer>
                <div style={windowFooterStyle.footerContainer}>
                    <div style={{width: "120px"}}>
                        <Button onClick={handleSettingsChange} icon={SettingsMajor}>
                            Settings
                        </Button>
                    </div>
                    <div style={windowFooterStyle.footerSettingsBlock}>
                        <Button onClick={handleModalChange}>
                            About
                        </Button>
                        <div style={windowFooterStyle.footerSaveButton}>
                            <Button onClick={handlePopulateTimeouter} loading={isLoading} primary>
                                Save
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>
            <Modal
                open={activeSettings}
                onClose={handleSettingsChange}
                title="Timeouter Settings"
                primaryAction={{
                    content: "Go back",
                    onAction: handleSettingsChange
                }}
            >
                <Modal.Section>
                    <TextContainer>
                        <p>
                            These are the main settings of your application.
                            These settings affect the display of your discount code,
                            the theme of the modal window itself, and other things.
                        </p>
                    </TextContainer>
                    <br/>
                    <TextField
                        value={timeouterDiscountCode}
                        onChange={handleTimeouterDiscountCode}
                        autoComplete="script"
                        label="Enter you discount code"
                        type="timeouterDescription"
                        placeholder={"Discount code"}
                        helpText={
                            <span>
              This discount code will appear in modal window
            </span>
                        }
                    />
                    <br/>
                    <Select
                        label="Modal window duration"
                        options={timeOptions}
                        onChange={handleTimeouterTime}
                        value={selectedTimeouterDuration}
                        helpText={
                            <span>
                                Duration of your modal window display
                            </span>
                        }
                    />
                    <br/>
                    <Select
                        label="Display scope"
                        options={displayOptions}
                        onChange={handleTimeouterDisplay}
                        value={selectedTimeouterDisplay}
                        helpText={
                            <span>
                                Display location of the modal window
                            </span>
                        }
                        disabled={selectedDisplayScope}
                    />
                    <br/>
                    <ChoiceList
                        title="Timeouter theme"
                        choices={[
                            {label: "Light", value: "1"},
                            {label: "Dark", value: "0"}
                        ]}
                        selected={selectedTimeouterTheme}
                        onChange={handleOptionChangeTimeouterTheme}
                    />
                    <br/>
                    <ChoiceList
                        title="Timeouter status"
                        choices={[
                            {label: "Active", value: "1"},
                            {label: "Inactive", value: "0"}
                        ]}
                        selected={selectedTimeouterStatus}
                        onChange={handleOptionChangeTimeouterStatus}
                    />
                    <br/>
                    <Banner
                        title="Reset Timeouter"
                        action={{
                            content: "Delete",
                            onAction: deleteTimeouter,
                            loading: isLoading
                        }}
                        status="critical"
                    >
                        <p>
                            This action will delete all data about your Timeouter.
                            Before removing your modal window from the store,
                            make sure that you do not lose the necessary data from the fields
                        </p>
                    </Banner>
                </Modal.Section>
            </Modal>
            <Modal
                open={activeAbout}
                onClose={handleModalChange}
                title="How to use Timeouter?"
                primaryAction={{
                    content: "Go back",
                    onAction: handleModalChange
                }}
            >
                <Modal.Section>
                    <TextContainer>
                        <p>
                            The Timeouter app is the key to increasing your in-store sales by giving out discount
                            codes to both new customers and those who have already bought something in your store.
                        </p>
                        <p>
                            When the pop-up window expires in your store, the modal window will automatically
                            be removed from your store and will be shown when you change or add a time in the settings
                        </p>
                        <p>
                            Once the app is removed from your store, the settings will be reset, all script tags
                            will be
                            lost and deleted from your store.
                            You will also be able to reinstall the application and use it again, but with new
                            settings.
                        </p>
                        <DescriptionList
                            items={[
                                {
                                    term: "Title",
                                    description:
                                        "The main title of your modal window, which should usually interest the user. The length of this field should not exceed 25 characters."
                                },
                                {
                                    term: "Description",
                                    description:
                                        "The description is used to add more information about the meaning of your modal window. The length of this field should not exceed 60 characters."
                                },
                                {
                                    term: "Discount code",
                                    description:
                                        "A series of numbers and/or letters that a customer can enter at checkout to receive a discount or special offer. You can create a discount code in the \"Discounts\" tab in your store's admin panel."
                                },
                                {
                                    term: "Script duration",
                                    description:
                                        "The time of displaying your modal window in the shopify store."
                                },
                                {
                                    term: "Display scope",
                                    description:
                                        "Select the area where your modal window will be displayed. Be careful, this item can only be changed after resetting."
                                },
                                {
                                    term: "Timeouter theme",
                                    description:
                                        "This setting affects the theme of your modal window."
                                },
                                {
                                    term: "Timeouter status",
                                    description:
					"The status of the display of the modal window in your store. You also need to enable the script in Online Store -> Customize -> App embeds."

                                }
                            ]}
                        />
                        <p>
                            If you notice that for some reason your script tag does not work, you can email us:
                            <Link url="mailto: timeouter@gmail.com">
                                <b>
                                    marketplace.sf@innowise-group.com
                                </b>
                            </Link>
                        </p>
                    </TextContainer>
                </Modal.Section>
            </Modal>
            <FooterHelp>
                Learn more about{" "}
                <Link external="true" url="/documents/privacy-policy.html">
                    privacy policy
                </Link>
            </FooterHelp>
        </>
    );
}
