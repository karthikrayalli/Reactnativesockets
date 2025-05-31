import React, { useEffect, useState } from 'react';

// import notifee from '@notifee/react-native';
// import messaging from '@react-native-firebase/messaging';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import { createDrawerNavigator, DrawerContentScrollView, DrawerItem, DrawerItemList } from '@react-navigation/drawer';
// import { useAxiosSetup } from '../api/api';
// import { useAppSelector } from '../store/store';
// import useLogout from '../hooks/logout';

// import { DrawerParamList, MainBottomTabParamList, RootStackParamList } from '../types/index';
// import { globalColors, globalFontSize, globalStyleVariables, width } from '../assets/globalStyles/globalStyles';

import { Image, Platform, StyleSheet } from 'react-native';
// import { IRouterTypes } from '../types/localState';

//Log In Screens
// import OnBoarding from '../pages/onBoarding/onBoarding';

//Logged In Screens
// import UserHome from '../pages/home/home';
// import Profile from '../pages/profile/profile';
// import PersonalInfo from '../pages/profile/personalInfo';
// import Help from '../pages/profile/help/help';
// import Privacy from '../pages/profile/privacy/privacy';
// import Search from '../pages/search/search';
// import OtherUsersProfile from '../pages/otherUsersProfile/otherUsersProfile';
// import Notifications from '../pages/notifications/notifications';
// import DrawerContent from '../pages/drawerContent/drawerContent';
// import Button from '../components/button/button';
// import ConversationsScreen from '../pages/chatMessaging/CoversationsScreen';
// import ChatScreen from '../pages/chatMessaging/ChatScreen';
// import LoginScreen from '../pages/onBoarding/onBoarding';
// import RegisterScreen from '../pages/onBoarding/registrationScreen';
import Login from '../screens/login';
import MyChatList from '../screens/chat/MyChatList';
import NewChats from '../screens/chat/NewChats';
import { useAuth } from '../context/chatContext';
import ChatArea from '../screens/chat/ChatArea';

// const HomeIcon = require('../assets/images/png/bottom_tabs/1.png')
// const LeaveIcon = require('../assets/images/png/bottom_tabs/2.png')
// const AttendanceIcon = require('../assets/images/png/bottom_tabs/3.png')
// const CalendarIcon = require('../assets/images/png/bottom_tabs/4.png')
// const ProfileIcon = require('../assets/images/png/bottom_tabs/5.png')

const linking = {
    prefixes: ['texflow://']
};

/*
 * @name AuthStackScreen
 * @description screens before user logged in
 */
const AuthStack = createNativeStackNavigator();
const AuthStackScreen = () => (
    <AuthStack.Navigator initialRouteName='Login'>
        <AuthStack.Screen
            name="Login"
            component={Login}
            options={{
                headerShown: false
            }}
        />
    </AuthStack.Navigator>
);

const HomeStack = createNativeStackNavigator();
const HomeStackScreen = () => {
    return (
        <HomeStack.Navigator initialRouteName='UserHome'>
            <HomeStack.Screen
                name="UserHome"
                component={TabScreen}
                options={{
                    headerShown: false
                }}
            />
            <HomeStack.Screen
                name="ChatArea"
                component={ChatArea}
                options={{
                    headerShown: false
                }}
            />
        </HomeStack.Navigator>
    )
}

// const Drawer = createDrawerNavigator<any>();

// function CustomDrawerContent(props) {
//   return (
//     <DrawerContentScrollView {...props}>
//       <DrawerItemList {...props} />
//       {/* <DrawerItem
//         label="Help"
//         onPress={() => null}
//       /> */}
//     </DrawerContentScrollView>
//   );
// }

// const DrawerScreen = () => {
//     return (
//         <Drawer.Navigator
//             drawerContent={(props) => <CustomDrawerContent {...props} />}
//             initialRouteName='Drawer'
//                 screenOptions={{
//       drawerActiveTintColor: 'white',
//       drawerActiveBackgroundColor: '#003CB3',
//       drawerLabelStyle: {
//         color: 'white',
//       },
//     }}
//         >
//             {/* <Drawer.Screen name="Drawer" component={TabScreen} options={{
//                 headerShown: false,
//                 drawerPosition: 'left',
//                 drawerStyle: {
//                     width: width / 1.4
//                 }
//             }}
//             /> */}
//             <Drawer.Screen name="Drawer" component={TabScreen} options={{
//                 headerShown: false,
//                 drawerPosition: 'left',
//                 drawerStyle: {
//                     width: width / 1.4
//                 }
//             }}
//             />
//         </Drawer.Navigator>
//     )
// }

/*
 * @name TabScreen
 * @description screens for bottom tab navigator
 */
const Tab = createBottomTabNavigator();
const TabScreen = () => {
    return (
        <Tab.Navigator
            initialRouteName="MyChats"
            screenOptions={({ route }) => ({
                headerShown: false,
                // tabBarLabelStyle: {
                //     fontSize: globalFontSize.font12,
                //     fontFamily: globalStyleVariables.fontPoppinsRegular
                // },
                tabBarStyle: {
                    // backgroundColor: globalColors.WHITE,
                    // borderTopColor: globalColors.WHITE,
                    height: Platform.OS === 'ios' ? 85 : 60,
                    paddingBottom: Platform.OS === 'ios' ? 25 : 0,
                    // shadowColor: globalColors.LIGHTERGREY,
                    shadowOpacity: 0.3,
                    shadowOffset: { width: 2, height: 0 },
                    elevation: 10
                },
                // tabBarIcon: () => {
                //     let iconName;
                //     if (route.name === 'Home') {
                //         iconName = HomeIcon;
                //     } else if (route.name === 'Leaves') {
                //         iconName = LeaveIcon
                //     } else if (route.name === 'Attendance') {
                //         iconName = AttendanceIcon
                //     } else if (route.name === 'Calendar') {
                //         iconName = CalendarIcon
                //     } else if (route.name === 'Profile') {
                //         iconName = ProfileIcon
                //     }
                //     return (
                //         <Image source={iconName} style={[styles.imageStyle]} />
                //     )
                // },
                // tabBarActiveTintColor: globalColors.BLUE,
                // tabBarInactiveTintColor: globalColors.LIGHTGRAY,
                tabBarAllowFontScaling: false,
                tabBarHideOnKeyboard: true
            })}>
            <Tab.Screen
                name="MyChats"
                component={MyChatList}
                options={{
                    headerShown: false,
                    tabBarAllowFontScaling: false,
                    title: 'My Chats'
                }}
                // initialParams={{ activeTab }}
            />
            <Tab.Screen
                name="NewChats"
                component={NewChats}
                options={{
                    headerShown: false,
                    tabBarAllowFontScaling: false,
                    title: 'New Chats'
                }}
                // initialParams={{ activeTab }}
            />
        </Tab.Navigator>
    );
}
const RootStack = createNativeStackNavigator();

const RootStackScreen = () => {
  const { isAuthenticated } = useAuth();
//     // const { session, updateTokens } = useSession();
//     // const descope = useDescope();
//     // const { handleLogout } = useLogout();
//     const { baseUrl } = useAppSelector(s => s.valueState);
//     useAxiosSetup("")
//     console.log("user",user)
//     const [state, setState] = useState<IRouterTypes>({
//         splash: false
//     });

//     const { splash } = state;

//     useEffect(() => {
//         setTimeout(() => {
//             setState({ ...state, splash: true })
//         }, 1000);
//     }, [])

//     useEffect(() => {
//         return notifee.onForegroundEvent(({ type, detail }) => {
//             console.log("foreground event", detail);
//         });
//     }, []);

//     useEffect(() => {
//         return messaging().setBackgroundMessageHandler(async remoteMessage => {
//             console.log(' background event', remoteMessage);
//         });
//     }, []);

    // if (!splash) {
    //     return (
    //         null
    //     )
    // } else {
        return (
            <RootStack.Navigator>
                {isAuthenticated ? (
                    <RootStack.Screen
                        name="User"
                        component={HomeStackScreen}
                        options={{
                            headerShown: false,
                            gestureEnabled: false
                        }}
                    />

                ) : (
                    <RootStack.Screen
                        name="Auth"
                        component={AuthStackScreen}
                        options={{
                            headerShown: false,
                            gestureEnabled: false
                        }}
                    />
                )}
            </RootStack.Navigator>
        );
    // }
}

const Router = () => {
    return (
        <NavigationContainer linking={linking}>
            <RootStackScreen />
        </NavigationContainer>
    );
};
export default Router;

const styles = StyleSheet.create({
    imageStyle: {
        width: 22,
        height: 22,
        resizeMode: "contain"
    }
})