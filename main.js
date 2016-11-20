var app = angular.module('app', []);

app.controller('mainController', ['$scope', function($scope) {
  $scope.value1 = 30;
  $scope.value2 = 26;
  $scope.value3 = 22;
  $scope.value4 = 18;

  $scope.$watch('value1', function(newVal){
    $scope.value2 = newVal - 4;
    $scope.value3 = newVal - 8;
    $scope.value4 = newVal - 12;
  });



  $scope.minValue = 10;
  $scope.maxValue = 50;
  $scope.valueChangeHandler = function(newValue) {
    console.log('value is changed, new value : ' + newValue, $scope.value1, $scope.value2, $scope.value3, $scope.value4);
  }

}]);





