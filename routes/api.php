// Voice Call Routes
Route::middleware('auth:api')->group(function () {
    Route::post('/call/initiate', 'VoiceCallController@initiateCall');
    Route::post('/call/signal', 'VoiceCallController@handleSignal');
    Route::post('/call/ice-candidate', 'VoiceCallController@handleIceCandidate');
    Route::post('/call/end', 'VoiceCallController@endCall');
}); 