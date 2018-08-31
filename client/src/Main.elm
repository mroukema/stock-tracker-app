port module Main exposing (BackendError, Model, Msg(..), StockEntry, StockList, accendingOnColumn, decodeError, decodeStockData, decodeStockList, deleteTickerRequest, errorMessageDisplay, extractErrorMessageFromBody, getStockData, init, initialModel, main, onEnter, pendingStockEntries, pendingStockRow, postNewTickerRequest, removeSymbolButton, sendDeleteTickerRequest, sendNewTickerRequest, sendStockDataRequest, sortOnColumn, stockEntryBox, stockEntryRow, stockTableHeader, stringFromMaybeFloat, tickerInputField, update, view)

{-| TodoMVC implemented in Elm, using plain HTML and CSS for rendering.
This application is broken up into three key parts:

1.  Model - a full definition of the application's state
2.  Update - a way to step the application state forward
3.  View - a way to visualize our application state with HTML
    This clean division of concerns is a core part of Elm. You can read more about
    this in <http://guide.elm-lang.org/architecture/index.html>

-}

import Browser
import Browser.Dom as Dom
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Html.Keyed as Keyed
import Html.Lazy exposing (lazy, lazy2)
import Http
import Json.Decode as Json
import Json.Encode exposing (encode, object, string)
import Task


main : Program (Maybe StockList) Model Msg
main =
    Browser.document
        { init = init
        , view = \model -> { title = "Elm • Stocks", body = [ view model ] }
        , update = update
        , subscriptions = \_ -> Sub.none
        }



-- Model


type alias Model =
    { errorMessage : Maybe Http.Error
    , symbolInputText : String
    , refreshing : Bool
    , pending : Maybe (List String)
    , stockData : StockList
    }


type alias StockEntry =
    { symbol : String
    , price : Maybe Float
    , average : Maybe Float
    , delta : Maybe Float
    , deltaPercent : Maybe Float
    }


type alias StockList =
    List StockEntry


type alias BackendError =
    { statusCode : Int
    , message : String
    }


type Msg
    = NoOp
    | LoadStockData (Result Http.Error StockList)
    | RefreshData
    | PostNewTickerRequest String
    | UpdateAddTickerContent String
    | DeleteTickerRequest String


init : Maybe StockList -> ( Model, Cmd Msg )
init flags =
    ( initialModel, sendStockDataRequest )


initialModel : Model
initialModel =
    { errorMessage = Nothing
    , symbolInputText = ""
    , refreshing = False
    , pending = Just []
    , stockData = [ StockEntry "APPN" (Just 0.0) (Just 0.0) Nothing Nothing ]
    }



-- Update


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        NoOp ->
            ( model, Cmd.none )

        LoadStockData result ->
            case result of
                Err value ->
                    ( { model
                        | refreshing = False
                        , pending = Nothing
                        , errorMessage = Just value
                      }
                    , Cmd.none
                    )

                Ok data ->
                    ( { model
                        | stockData = data
                        , refreshing = False
                        , pending = Nothing
                        , errorMessage = Nothing
                      }
                    , Cmd.none
                    )

        RefreshData ->
            ( { model | refreshing = True }, sendStockDataRequest )

        PostNewTickerRequest tickerSymbol ->
            ( { model
                | pending = Just <| tickerSymbol :: []
                , symbolInputText = ""
              }
            , sendNewTickerRequest tickerSymbol
            )

        UpdateAddTickerContent value ->
            ( { model | symbolInputText = value }, Cmd.none )

        DeleteTickerRequest symbolToRemove ->
            ( model, sendDeleteTickerRequest symbolToRemove )


decodeError : Json.Decoder BackendError
decodeError =
    Json.map2 BackendError
        (Json.field "statusCode" Json.int)
        (Json.field "message" Json.string)


decodeStockData : Json.Decoder StockEntry
decodeStockData =
    Json.map5 StockEntry
        (Json.field "symbol" Json.string)
        (Json.maybe <| Json.field "price" Json.float)
        (Json.maybe <| Json.field "average" Json.float)
        (Json.maybe <| Json.field "delta" Json.float)
        (Json.maybe <| Json.field "deltaPercent" Json.float)


decodeStockList : Json.Decoder StockList
decodeStockList =
    Json.list decodeStockData


getStockData : Http.Request StockList
getStockData =
    Http.get
        "http://127.0.0.1:8787/stockList"
        decodeStockList


postNewTickerRequest : String -> Http.Request StockList
postNewTickerRequest message =
    Http.post
        "http://127.0.0.1:8787/newTicker"
        (Http.jsonBody <| object [ ( "symbol", string message ) ])
        decodeStockList


deleteTickerRequest : String -> Http.Request StockList
deleteTickerRequest symbolToRemove =
    Http.request
        { method = "DELETE"
        , headers = []
        , url = "http://127.0.0.1:8787/deleteTicker"
        , body = Http.jsonBody <| object [ ( "symbol", string symbolToRemove ) ]
        , expect = Http.expectJson decodeStockList
        , timeout = Nothing
        , withCredentials = False
        }


sendDeleteTickerRequest : String -> Cmd Msg
sendDeleteTickerRequest symbol =
    Http.send LoadStockData <| deleteTickerRequest symbol


sendStockDataRequest : Cmd Msg
sendStockDataRequest =
    Http.send LoadStockData getStockData


sendNewTickerRequest : String -> Cmd Msg
sendNewTickerRequest message =
    Http.send LoadStockData (postNewTickerRequest message)



--sortOnColumn: (StockEntry -> comparable) -> StockList -> StockList


sortOnColumn compr stockList =
    List.sortWith compr stockList


accendingOnColumn column a b =
    compare (column a) (column b)



-- View


view : Model -> Html Msg
view model =
    let
        refreshButtonText =
            case model.refreshing of
                True ->
                    "Refreshing"

                False ->
                    "Refresh"

        errorDiv =
            case model.errorMessage of
                Nothing ->
                    div [] []

                Just value ->
                    errorMessageDisplay value
    in
    div []
        [ errorDiv
        , tickerInputField model.symbolInputText
        , button
            [ onClick <|
                PostNewTickerRequest model.symbolInputText
            ]
            [ text "SUBMIT" ]
        , button [ onClick RefreshData ] [ text refreshButtonText ]
        , table []
            (stockTableHeader model.stockData
                :: List.concat
                    [ pendingStockEntries model.pending
                    , List.map stockEntryRow model.stockData
                    ]
            )
        ]


stringFromMaybeFloat : Maybe Float -> String -> String
stringFromMaybeFloat maybeFloat defaultString =
    case maybeFloat of
        Just float ->
            String.fromFloat float

        Nothing ->
            defaultString


pendingStockEntries : Maybe (List String) -> List (Html Msg)
pendingStockEntries pendingEntries =
    case pendingEntries of
        Nothing ->
            []

        Just value ->
            List.map pendingStockRow value


pendingStockRow : String -> Html Msg
pendingStockRow symbol =
    tr []
        [ stockEntryBox <| String.toUpper symbol
        , stockEntryBox "...pending..."
        , stockEntryBox "...pending..."
        , stockEntryBox "...pending..."
        , stockEntryBox "...pending..."
        , stockEntryBox "...pending..."
        ]


stockEntryRow : StockEntry -> Html Msg
stockEntryRow entry =
    tr []
        [ stockEntryBox entry.symbol
        , stockEntryBox (stringFromMaybeFloat entry.price "-")
        , stockEntryBox (stringFromMaybeFloat entry.average "-")
        , stockEntryBox (stringFromMaybeFloat entry.delta "-")
        , stockEntryBox (stringFromMaybeFloat entry.deltaPercent "-")
        , removeSymbolButton entry.symbol
        ]


tickerInputField : String -> Html Msg
tickerInputField textData =
    input
        [ placeholder "Add a new stock to track"
        , onInput UpdateAddTickerContent
        , onEnter <| PostNewTickerRequest textData
        , value textData
        ]
        []


onEnter : Msg -> Attribute Msg
onEnter msg =
    let
        isEnter code =
            if code == 13 then
                Json.succeed msg

            else
                Json.fail "not ENTER"
    in
    on "keydown" (Json.andThen isEnter keyCode)


errorMessageDisplay : Http.Error -> Html msg
errorMessageDisplay error =
    case error of
        Http.BadUrl url ->
            div [] [ text <| "Invalid request url: " ++ url ]

        Http.Timeout ->
            div [] [ text "Request timed out" ]

        Http.BadPayload message response ->
            div []
                [ text <|
                    "Request returned Successfully but got unexpected payload: "
                        ++ message
                ]

        Http.NetworkError ->
            div [] [ text "Request failed due to network error" ]

        Http.BadStatus response ->
            div []
                [ div []
                    [ text <|
                        "Error: "
                            ++ String.fromInt response.status.code
                            ++ " "
                            ++ response.status.message
                    ]
                , div []
                    [ text <|
                        ("Message: "
                            ++ "'"
                            ++ extractErrorMessageFromBody response.body
                        )
                            ++ "'"
                    ]
                ]


extractErrorMessageFromBody : String -> String
extractErrorMessageFromBody body =
    case Json.decodeString decodeError body of
        Ok value ->
            value.message

        Err value ->
            ""


stockTableHeader : StockList -> Html Msg
stockTableHeader stockData =
    tr []
        [ th [] [ text "Symbol" ]
        , th [] [ text "Price" ]
        , th [] [ text "Average" ]
        , th [] [ text "Delta" ]
        , th [] [ text "Delta Percent" ]
        , th [] [ text "Actions" ]
        ]


removeSymbolButton : String -> Html Msg
removeSymbolButton symbolToRemove =
    button [ onClick <| DeleteTickerRequest symbolToRemove ]
        [ text "Remove"
        ]


stockEntryBox : String -> Html msg
stockEntryBox value =
    td [] [ text value ]
